/**
 * Routeur de navigation Cantou : rendu des sous-écrans (`sub`) et des écrans
 * principaux (onglets `tab`) + barre d'onglets, avec gestes de swipe.
 * Extrait de App.jsx (comportement inchangé, mêmes data-testid).
 */
import { lazy, Suspense } from 'react'
import { ImpactStyle } from '@capacitor/haptics'
import { GITE_COORDS } from './data.js'
import { BUILD_NUMBER } from './build-info.js'
import { eur, buildList, fmtDayShort, fmtMonthYear } from './utils.js'
import { weatherSuggestion } from './weather.js'
import { formatLastBackup } from './backup.js'
import { encodeSharePayload, shareConfig as shareConfigText } from './share-config.js'
import { loadTrack, clearTrack, buildTrackingExport, shareTracking } from './tracking.js'
import { shareRecap } from './recap.js'
import { Budget } from './screens/Budget.jsx'
import { Repas } from './screens/Repas.jsx'
import { Planning } from './screens/Planning.jsx'
import { Visites } from './screens/Visites.jsx'
import { Accueil } from './screens/Accueil.jsx'
const Meteo = lazy(() => import('./screens/Meteo.jsx').then(m => ({ default: m.Meteo })))
const Hebergement = lazy(() => import('./screens/Hebergement.jsx').then(m => ({ default: m.Hebergement })))
const Logistique = lazy(() => import('./screens/Logistique.jsx').then(m => ({ default: m.Logistique })))
const Trajet = lazy(() => import('./screens/Trajet.jsx').then(m => ({ default: m.Trajet })))
const Souvenirs = lazy(() => import('./screens/Souvenirs.jsx').then(m => ({ default: m.Souvenirs })))
const Bingo = lazy(() => import('./screens/Bingo.jsx').then(m => ({ default: m.Bingo })))
const Bilan = lazy(() => import('./screens/Bilan.jsx').then(m => ({ default: m.Bilan })))
const Restos = lazy(() => import('./screens/Restos.jsx').then(m => ({ default: m.Restos })))
const Departure = lazy(() => import('./screens/Departure.jsx').then(m => ({ default: m.Departure })))
const Itinerary = lazy(() => import('./screens/Itinerary.jsx').then(m => ({ default: m.Itinerary })))
const Carte = lazy(() => import('./screens/Carte.jsx').then(m => ({ default: m.Carte })))
const CarteDetaillee = lazy(() => import('./screens/CarteDetaillee.jsx').then(m => ({ default: m.CarteDetaillee })))
const Reglages = lazy(() => import('./screens/Reglages.jsx').then(m => ({ default: m.Reglages })))
const PartageConfig = lazy(() => import('./screens/PartageConfig.jsx').then(m => ({ default: m.PartageConfig })))
const Sejours = lazy(() => import('./screens/Sejours.jsx').then(m => ({ default: m.Sejours })))

export function Navigation({
  addDepartureItem, addShoppingItem, bingo, bingoItems, budgetCats, budgetTotal, bumpCow, capturePhoto, carGames, carSpot, catColor, challengeDone, checks, countdown, coursesDone, coursesGroups, coursesPct, coursesSorted, coursesTotal, cur, currentStoreData, dailyChallenge, darkMode, day, days, deleteActivity, deleteCourseCategory, deleteCourseItem, deleteExpense, deleteLogiItem, deleteLogiList, deleteMeal, deleteMeteo, deletePhoto, deleteResto, deleteShoppingItem, deleteSuggestion, deleteTrajetCheckItem, deleteTrajetStep, deleteVisit, departure, editActivity, editDay, editMeal, editMeteo, editTrajetStep, editVisit, emergencyNumbers, expenses, familyMembers, filter, filteredVisits, findCar, forgetCar, haptic, hebergement, isCheckoutSoon, isDepartureDay, isOn, journal, kidsGames, lastBackupAt, loadSrc, logi, logiSorted, markChallengeDone, mealTab, meals, meteo, newShoppingItem, newSuggestionText, openAddMeal, openAddMeteo, openAddResto, openDayJournal, openEditResto, openHebEdit, openJournal, openMaps, openModule, openMyPosition, openTripEdit, packDone, packPct, packTotal, parkCar, photos, rateVisit, ratings, recapData, remain, removeDepartureItem, resetCows, resetToDefaults, restos, runSelfTestAndShow, saved, savedCount, sendSuggestions, setBudgetTotal, setCoursesSorted, setDarkMode, setDay, setEditingCourseKey, setEditingLogiKey, setEditingTrajetIdx, setEditingVisitId, setExportCopied, setFeatures, setFilter, setLogiSorted, setMealTab, setNewBudgetTotal, setNewShoppingItem, setNewSuggestionText, setNewTrajetColor, setNewTrajetNote, setNewTrajetPlace, setNewTrajetTime, setNewVisitAge, setNewVisitCat, setNewVisitDist, setNewVisitDur, setNewVisitName, setOnboarded, setSaved, setShowAdd, setShowAddCourseCat, setShowAddCourseItem, setShowAddLogiItem, setShowAddLogiList, setShowAddTrajetCheck, setShowBudgetTotalEdit, setShowChangelog, setShowDayAdd, setShowExport, setShowImport, setShowTrajetEdit, setShowVisitEdit, setShowVote, setSortExpenses, setSub, setTab, setTrajetDir, setTrip, setVisitNote, setVisitSort, shareActivity, shareDay, shoppingItems, sortExpenses, spent, spentPct, srcMap, startAddActivity, startEditExpense, sub, subScreenSwipe, subTitle, submitSuggestion, suggestions, sx, tab, tabBarSwipe, today, toggleBingo, toggleCheck, toggleDeparture, toggleFeature, toggleSaved, toggleShoppingItem, tr, trajetDir, trajets, trip, visibleTabs, visitSort, visits,
}) {
  return (
    <>
      {/* ============ SOUS-ÉCRANS ============ */}
      {sub && (
        <div data-testid="sub-screen-wrapper" onTouchStart={subScreenSwipe.onTouchStart} onTouchEnd={subScreenSwipe.onTouchEnd} style={sx('height:100%;display:flex;flex-direction:column;')}>
          <div style={sx('display:flex;align-items:center;gap:8px;padding:54px 14px 12px;background:#fffdf8;border-bottom:1px solid #ece2cf;flex:0 0 auto;')}>
            <button data-testid="sub-back" onClick={() => setSub(null)} style={sx('width:36px;height:36px;border:none;background:#f1e9da;border-radius:50%;font-size:22px;line-height:1;cursor:pointer;color:#4a5d3a;display:flex;align-items:center;justify-content:center;padding-bottom:4px;')}>‹</button>
            <span style={sx('font-family:Quicksand;font-weight:700;font-size:19px;')}>{subTitle}</span>
          </div>
          {/* key={sub} remonte le conteneur à chaque navigation → rejoue screenIn */}
          <div key={sub} className="screen-in" style={sx('flex:1;overflow-y:auto;')}>
            <Suspense fallback={null}>

            {/* TRAJET */}
            {sub === 'trajet' && (
              <Trajet
                sx={sx} trajetDir={trajetDir} setTrajetDir={setTrajetDir} trip={trip} fmtDayShort={fmtDayShort} trajets={trajets}
                editTrajetStep={editTrajetStep} deleteTrajetStep={deleteTrajetStep}
                setEditingTrajetIdx={setEditingTrajetIdx} setNewTrajetTime={setNewTrajetTime} setNewTrajetPlace={setNewTrajetPlace}
                setNewTrajetNote={setNewTrajetNote} setNewTrajetColor={setNewTrajetColor} setShowTrajetEdit={setShowTrajetEdit}
                tr={tr} setShowAddTrajetCheck={setShowAddTrajetCheck} toggleCheck={toggleCheck} deleteTrajetCheckItem={deleteTrajetCheckItem}
                carGames={carGames} bumpCow={bumpCow} resetCows={resetCows}
              />
            )}

            {/* SOUVENIRS */}
            {sub === 'souvenirs' && (
              <Souvenirs sx={sx} photos={photos} days={days} srcMap={srcMap} capturePhoto={capturePhoto} deletePhoto={deletePhoto} loadSrc={loadSrc} shareDay={shareDay} journal={journal} openDayJournal={openDayJournal} trip={trip} />
            )}

            {/* BINGO */}
            {sub === 'bingo' && (
              <Bingo sx={sx} items={bingoItems} checked={bingo} toggleBingo={toggleBingo} />
            )}

            {/* BILAN */}
            {sub === 'bilan' && (
              <Bilan sx={sx} recap={recapData} onShare={() => { haptic(ImpactStyle.Medium); shareRecap(recapData) }} />
            )}

            {/* RESTOS */}
            {sub === 'restos' && (
              <Restos sx={sx} restos={restos} openAddResto={openAddResto} openEditResto={openEditResto} deleteResto={deleteResto} />
            )}

            {/* DÉPART DU GÎTE */}
            {sub === 'departure' && (
              <Departure sx={sx} departure={departure} toggleDeparture={toggleDeparture} addDepartureItem={addDepartureItem} removeDepartureItem={removeDepartureItem} />
            )}

            {/* ITINÉRAIRE DU JOUR */}
            {sub === 'itineraire' && (
              <Itinerary sx={sx} visits={visits} saved={saved} openMaps={openMaps} />
            )}

            {/* CARTE DU SÉJOUR (hors-ligne) */}
            {sub === 'carte' && (
              <Carte sx={sx} visits={visits} gite={{ ...GITE_COORDS, name: hebergement?.nom }} carSpot={carSpot} savedIds={Object.keys(saved).filter((k) => saved[k]).map(Number)} findCar={findCar} openDetailed={() => setSub('carte-detaillee')} />
            )}

            {/* CARTE DÉTAILLÉE (OpenTopoMap, en ligne, repli hors-ligne) */}
            {sub === 'carte-detaillee' && (
              <CarteDetaillee sx={sx} visits={visits} gite={{ ...GITE_COORDS, name: hebergement?.nom }} carSpot={carSpot} savedIds={Object.keys(saved).filter((k) => saved[k]).map(Number)} findCar={findCar} />
            )}

            {/* RÉGLAGES (fonctions désactivables) */}
            {sub === 'reglages' && (
              <Reglages sx={sx} isOn={isOn} toggleFeature={toggleFeature} relaunchOnboarding={() => { setOnboarded(false); setSub(null) }}
                trackingCount={loadTrack().length}
                onShareTracking={() => { haptic(ImpactStyle.Light); shareTracking(JSON.stringify(buildTrackingExport(loadTrack(), { build: BUILD_NUMBER }), null, 2)) }}
                onResetTracking={() => { haptic(ImpactStyle.Medium); clearTrack() }} />
            )}

            {/* MES SÉJOURS (multi-séjours / modèles réutilisables) */}
            {sub === 'sejours' && (
              <Sejours sx={sx} trip={trip} fmtDayShort={fmtDayShort} fmtMonthYear={fmtMonthYear} currentStoreData={currentStoreData} resetToDefaults={resetToDefaults} />
            )}

            {/* PARTAGE DE CONFIG (QR + copier/coller, hors-ligne) */}
            {sub === 'partage-config' && (
              <PartageConfig sx={sx} payloadText={encodeSharePayload(currentStoreData())} onShare={shareConfigText} setters={{ setTrip, setSaved, setBudgetTotal, setFeatures }} />
            )}

            {/* LOGISTIQUE */}
            {sub === 'logistique' && (
              <Logistique
                sx={sx} logi={logi} logiSorted={logiSorted} setLogiSorted={setLogiSorted}
                checks={checks} buildList={buildList} toggleCheck={toggleCheck}
                deleteLogiList={deleteLogiList} deleteLogiItem={deleteLogiItem}
                setEditingLogiKey={setEditingLogiKey} setShowAddLogiItem={setShowAddLogiItem}
                setShowAddLogiList={setShowAddLogiList}
              />
            )}

            {/* HEBERGEMENT */}
            {sub === 'hebergement' && (
              <Hebergement sx={sx} hebergement={hebergement} openHebEdit={openHebEdit} />
            )}

            {/* METEO */}
            {sub === 'meteo' && (
              <Meteo sx={sx} meteo={meteo} trip={trip} fmtDayShort={fmtDayShort} editMeteo={editMeteo} deleteMeteo={deleteMeteo} openAddMeteo={openAddMeteo} />
            )}

            </Suspense>
          </div>
        </div>
      )}

      {/* ============ ÉCRANS PRINCIPAUX (onglets) ============ */}
      {!sub && (
        <div style={sx('height:100%;display:flex;flex-direction:column;')}>
          {/* key={tab} remonte le conteneur à chaque changement d'onglet → rejoue screenIn */}
          <div key={tab} className="screen-in" style={sx('flex:1;overflow-y:auto;')}>

            {/* ACCUEIL */}
            {tab === 'accueil' && (
              <Accueil
                sx={sx} darkMode={darkMode} setDarkMode={setDarkMode} openTripEdit={openTripEdit} fmtDayShort={fmtDayShort} fmtMonthYear={fmtMonthYear}
                trip={trip} countdown={countdown} today={today} setTab={setTab} setDay={setDay} setSub={setSub}
                packDone={packDone} packTotal={packTotal} packPct={packPct} openModule={openModule}
                newSuggestionText={newSuggestionText} setNewSuggestionText={setNewSuggestionText} submitSuggestion={submitSuggestion}
                suggestions={suggestions} deleteSuggestion={deleteSuggestion} sendSuggestions={sendSuggestions}
                lastBackupAt={lastBackupAt} formatLastBackup={formatLastBackup} setExportCopied={setExportCopied}
                setShowExport={setShowExport} setShowImport={setShowImport} runSelfTestAndShow={runSelfTestAndShow}
                isDepartureDay={isDepartureDay} quickPhoto={() => { setSub('souvenirs'); capturePhoto('camera') }} openMyPosition={openMyPosition} openChangelog={() => setShowChangelog(true)}
                isCheckoutSoon={isCheckoutSoon} departureDone={departure.filter((i) => i.done).length} departureTotal={departure.length}
                dailyChallenge={isOn('extra_challenge') ? dailyChallenge : null} challengeDone={challengeDone} markChallengeDone={markChallengeDone}
                carSpot={carSpot} parkCar={isOn('extra_carspot') ? parkCar : null} findCar={findCar} forgetCar={forgetCar}
                isOn={isOn} kidsGames={kidsGames} emergencyNumbers={emergencyNumbers}
                weatherSuggest={today && isOn('extra_weather_suggestions') ? weatherSuggestion(today.w, visits) : null} onOpenVisites={() => { setTab('visites'); setSub(null) }}
              />
            )}

            {/* PLANNING */}
            {tab === 'planning' && (
              <Planning
                sx={sx} days={days} trip={trip} fmtDayShort={fmtDayShort} day={day} setDay={setDay} setShowDayAdd={setShowDayAdd}
                cur={cur} editDay={editDay} editActivity={editActivity} deleteActivity={deleteActivity} startAddActivity={startAddActivity}
                openJournal={openJournal} shareActivity={shareActivity}
              />
            )}

            {/* VISITES */}
            {tab === 'visites' && (
              <Visites
                sx={sx} savedCount={savedCount} filter={filter} setFilter={setFilter} visitSort={visitSort} setVisitSort={setVisitSort}
                filteredVisits={filteredVisits} saved={saved}
                setEditingVisitId={setEditingVisitId} setNewVisitName={setNewVisitName} setNewVisitDist={setNewVisitDist}
                setNewVisitDur={setNewVisitDur} setNewVisitAge={setNewVisitAge} setNewVisitCat={setNewVisitCat} setShowVisitEdit={setShowVisitEdit}
                toggleSaved={toggleSaved} editVisit={editVisit} deleteVisit={deleteVisit}
                openVote={isOn('extra_vote') ? () => setShowVote(true) : null}
                ratings={ratings} rateVisit={rateVisit} setVisitNote={setVisitNote}
              />
            )}

            {/* REPAS */}
            {tab === 'repas' && (
              <Repas
                sx={sx} mealTab={mealTab} setMealTab={setMealTab} meals={meals} editMeal={editMeal} deleteMeal={deleteMeal} openAddMeal={openAddMeal}
                coursesDone={coursesDone} coursesTotal={coursesTotal} coursesPct={coursesPct} coursesSorted={coursesSorted} setCoursesSorted={setCoursesSorted} coursesGroups={coursesGroups}
                toggleCheck={toggleCheck} deleteCourseCategory={deleteCourseCategory} deleteCourseItem={deleteCourseItem}
                setEditingCourseKey={setEditingCourseKey} setShowAddCourseItem={setShowAddCourseItem} setShowAddCourseCat={setShowAddCourseCat}
                shoppingItems={shoppingItems} toggleShoppingItem={toggleShoppingItem} deleteShoppingItem={deleteShoppingItem}
                newShoppingItem={newShoppingItem} setNewShoppingItem={setNewShoppingItem} addShoppingItem={addShoppingItem}
              />
            )}

            {/* BUDGET */}
            {tab === 'budget' && (
              <Budget
                sx={sx} eur={eur} catColor={catColor} remain={remain} budgetTotal={budgetTotal} spentPct={spentPct} spent={spent}
                setNewBudgetTotal={setNewBudgetTotal} setShowBudgetTotalEdit={setShowBudgetTotalEdit} setShowAdd={setShowAdd} budgetCats={budgetCats}
                sortExpenses={sortExpenses} setSortExpenses={setSortExpenses} expenses={expenses} startEditExpense={startEditExpense} deleteExpense={deleteExpense}
                familyMembers={familyMembers} srcMap={srcMap} loadSrc={loadSrc}
              />
            )}

          </div>

          {/* BARRE D'ONGLETS */}
          <div data-testid="tab-bar" onTouchStart={tabBarSwipe.onTouchStart} onTouchEnd={tabBarSwipe.onTouchEnd} style={sx('flex:0 0 auto;display:flex;background:rgba(255,253,248,0.97);border-top:1px solid #ece2cf;padding:8px 6px 24px;')}>
            {visibleTabs.map(([key, emoji, label]) => (
              <button key={key} data-testid={`tab-${key}`} onClick={() => { setTab(key); setSub(null) }} style={sx('flex:1;border:none;background:transparent;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;padding:4px 0;')}>
                <span style={sx('font-size:19px;')}>{emoji}</span>
                <span style={sx(`font-size:12px;color:${tab === key ? '#4a5d3a' : '#6b6354'};font-weight:${tab === key ? '700' : '600'};`)}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
