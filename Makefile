.PHONY: help setup build clean context-reset

help:
	@echo "Cantou — cibles disponibles :"
	@echo "  make setup    Démarre le profil Colima amd64/Rosetta (une fois par session)"
	@echo "  make build    Compile l'APK dans Docker -> build/outputs/apk/cantou-release.apk"
	@echo "  make clean    Supprime les artefacts locaux (build/, dist/, android/)"
	@echo "  make context-reset  Repointe docker vers le profil Colima par défaut"

setup:
	colima start cantou --vm-type vz --vz-rosetta --cpu 4 --memory 8 --disk 30

build:
	./build-docker.sh

clean:
	rm -rf build dist android

context-reset:
	docker context use colima

.DEFAULT_GOAL := help
