# Image épinglée en amd64 : AAPT2 n'existe qu'en x86_64.
# Sur Apple Silicon, Rosetta (via Colima vz) traduit les binaires x86_64.
FROM --platform=linux/amd64 node:20-slim

ENV DEBIAN_FRONTEND=noninteractive \
    ANDROID_HOME=/android-sdk \
    ANDROID_SDK_ROOT=/android-sdk \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
    PATH="/android-sdk/cmdline-tools/latest/bin:/android-sdk/platform-tools:${PATH}"

RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jdk-headless curl wget git unzip zip \
    && rm -rf /var/lib/apt/lists/*

# Android SDK command-line tools
RUN mkdir -p /android-sdk/cmdline-tools && cd /android-sdk/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O cmdtools.zip && \
    unzip -q cmdtools.zip && rm cmdtools.zip && \
    mkdir -p latest && mv cmdline-tools/* latest/ 2>/dev/null || true

# Licences + packages SDK (Capacitor 6 cible android-34 / build-tools 34)
RUN yes | sdkmanager --licenses >/dev/null 2>&1 || true && \
    sdkmanager "platform-tools" \
        "platforms;android-34" "platforms;android-35" \
        "build-tools;34.0.0" "build-tools;35.0.0" 2>&1 | tail -5

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . /workspace
WORKDIR /workspace

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
