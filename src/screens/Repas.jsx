/** Écran Repas & courses — menus du séjour + liste de courses par catégorie. */
export function Repas({
  sx, mealTab, setMealTab, meals, editMeal, deleteMeal, openAddMeal,
  coursesDone, coursesTotal, coursesPct, coursesSorted, setCoursesSorted, coursesGroups,
  toggleCheck, deleteCourseCategory, deleteCourseItem, setEditingCourseKey, setShowAddCourseItem, setShowAddCourseCat,
  shoppingItems, toggleShoppingItem, deleteShoppingItem,
  newShoppingItem, setNewShoppingItem, addShoppingItem,
}) {
  return (
    <div data-testid="screen-repas">
      <div style={sx('padding:54px 18px 14px;')}>
        <div style={sx('font-family:Quicksand;font-weight:700;font-size:26px;')}>Repas &amp; courses</div>
      </div>
      <div style={sx('margin:0 18px 16px;display:flex;background:#ece2cf;border-radius:14px;padding:4px;')}>
        <button onClick={() => setMealTab('repas')} style={sx(`flex:1;border:none;border-radius:10px;padding:10px;font-weight:700;font-family:Quicksand;font-size:15px;cursor:pointer;background:${mealTab === 'repas' ? '#4a5d3a' : 'transparent'};color:${mealTab === 'repas' ? '#fffaf0' : '#6b6354'};`)}>Menus</button>
        <button onClick={() => setMealTab('courses')} style={sx(`flex:1;border:none;border-radius:10px;padding:10px;font-weight:700;font-family:Quicksand;font-size:15px;cursor:pointer;background:${mealTab === 'courses' ? '#4a5d3a' : 'transparent'};color:${mealTab === 'courses' ? '#fffaf0' : '#6b6354'};`)}>Courses</button>
      </div>

      {mealTab === 'repas' && (
        <>
          <div style={sx('padding:0 18px;display:flex;flex-direction:column;gap:10px;')}>
            {meals.map((ml) => (
              <div key={ml.id} style={sx('display:flex;align-items:center;gap:14px;background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;padding:12px 14px;')}>
                <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;color:#cf7d3c;width:54px;flex:0 0 auto;')}>{ml.day}</div>
                <div style={sx('font-weight:600;font-size:14px;flex:1;')}>{ml.dish}</div>
                <button onClick={() => editMeal(ml.id)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;')}>✏️</button>
                <button onClick={() => deleteMeal(ml.id)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 6px;color:#b8503f;')}>🗑️</button>
              </div>
            ))}
          </div>
          <button onClick={openAddMeal} style={sx('display:block;width:calc(100% - 36px);margin:10px 18px 0;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:14px;padding:10px;cursor:pointer;')}>+ Ajouter un repas</button>
          <div style={sx('margin:14px 18px 16px;background:#f1e4d4;border-radius:16px;padding:14px;font-size:13px;line-height:1.6;color:#6b5a45;')}>
            <div style={sx('font-weight:700;font-family:Quicksand;margin-bottom:4px;')}>🧀 Spécialités à goûter sur place</div>
            <div><b>Fromages</b> : Cantal AOP, Salers, Saint-Nectaire (ferme de Lavaissière).</div>
            <div><b>Plats</b> : truffade, aligot, pounti (cake viande-blettes-pruneaux), chou farci.</div>
            <div><b>Douceurs &amp; boissons</b> : crème de châtaigne, liqueur de gentiane.</div>
          </div>
        </>
      )}

      {mealTab === 'courses' && (
        <div style={sx('padding:0 18px 16px;')}>
          <div style={sx('display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#6b6354;margin-bottom:6px;')}><span>Liste de courses</span><span>{coursesDone}/{coursesTotal}</span></div>
          <div style={sx('height:9px;border-radius:8px;background:#efe6d4;overflow:hidden;margin-bottom:14px;')}><div style={sx(`height:100%;background:#5b7042;width:${coursesPct}%;`)} /></div>
          <div style={sx('display:flex;justify-content:flex-end;margin-bottom:14px;')}>
            <button onClick={() => setCoursesSorted(!coursesSorted)} style={sx(`border:1px solid ${coursesSorted ? '#4a5d3a' : '#ece2cf'};background:${coursesSorted ? '#4a5d3a' : '#fffdf8'};color:${coursesSorted ? '#fffaf0' : '#6b6354'};border-radius:999px;padding:6px 12px;font-weight:700;font-size:12px;cursor:pointer;`)}>↑ Non cochés en premier</button>
          </div>
          {coursesGroups.map((g) => (
            <div key={g.key} style={sx('margin-bottom:16px;')}>
              <div style={sx('display:flex;align-items:baseline;gap:8px;margin-bottom:6px;')}>
                <span style={sx('font-family:Quicksand;font-weight:700;font-size:15px;flex:1;')}>{g.name}</span>
                <span style={sx('font-size:12px;color:#6b6354;')}>{g.doneStr}</span>
                <button onClick={() => deleteCourseCategory(g.key)} style={sx('border:none;background:transparent;cursor:pointer;font-size:13px;padding:2px 4px;color:#b8503f;')}>🗑️</button>
              </div>
              <div style={sx('background:#fffdf8;border:1px solid #efe6d4;border-radius:16px;overflow:hidden;')}>
                {(coursesSorted ? [...g.items].sort((a, b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0)) : g.items).map((it) => (
                  <div key={it.label} style={sx('display:flex;align-items:center;width:100%;border-bottom:1px solid #f1e9da;')}>
                    <button onClick={() => toggleCheck(g.key, it.label)} style={sx('flex:1;text-align:left;border:none;background:transparent;display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;')}>
                      {it.checked ? (
                        <>
                          <span style={sx('width:24px;height:24px;flex:0 0 auto;border-radius:8px;background:#5b7042;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;')}>✓</span>
                          <span style={sx('font-size:14px;color:#6b6354;text-decoration:line-through;')}>{it.label}</span>
                        </>
                      ) : (
                        <>
                          <span style={sx('width:24px;height:24px;flex:0 0 auto;border-radius:8px;border:2px solid #d8cbb0;background:#fff;')} />
                          <span style={sx('font-size:14px;color:#2f2a22;')}>{it.label}</span>
                        </>
                      )}
                    </button>
                    <button onClick={() => deleteCourseItem(g.key, it.label)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;padding:4px 8px;color:#b8503f;flex:0 0 auto;')}>🗑️</button>
                  </div>
                ))}
              </div>
              <button onClick={() => { setEditingCourseKey(g.key); setShowAddCourseItem(true) }} style={sx('width:100%;margin-top:8px;border:1.5px dashed #c2a778;background:#fbf4e6;color:#9c6b4a;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:8px;cursor:pointer;')}>+ Ajouter article</button>
            </div>
          ))}
          <button data-testid="btn-add-course-cat" onClick={() => setShowAddCourseCat(true)} style={sx('width:100%;margin-top:4px;border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:14px;border-radius:14px;padding:12px;cursor:pointer;')}>+ Nouvelle catégorie</button>
          <div style={sx('margin-top:20px;padding-top:16px;border-top:1px solid #efe6d4;')}>
            <div style={sx('font-family:Quicksand;font-weight:700;font-size:13px;color:#6b6354;text-transform:uppercase;margin-bottom:10px;')}>Gerer les articles</div>
            <div style={sx('display:flex;flex-direction:column;gap:8px;')}>
              {shoppingItems.map((item) => (
                <div key={item.id} style={sx('display:flex;align-items:center;gap:12px;background:#fffdf8;border:1px solid #efe6d4;border-radius:12px;padding:10px 12px;')}>
                  <input type="checkbox" checked={item.checked} onChange={() => toggleShoppingItem(item.id)} style={sx('cursor:pointer;')} />
                  <span style={sx('font-size:14px;flex:1;')}>{item.label}</span>
                  <button onClick={() => deleteShoppingItem(item.id)} style={sx('border:none;background:transparent;cursor:pointer;font-size:14px;color:#b8503f;padding:4px;')}>🗑️</button>
                </div>
              ))}
            </div>
            <div style={sx('display:flex;gap:8px;margin-top:10px;')}>
              <input value={newShoppingItem} onChange={(e) => setNewShoppingItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addShoppingItem()} placeholder="Nouvel article…" style={sx('flex:1;border:1px solid #d8cbb0;background:#fffdf8;border-radius:12px;padding:10px 12px;font-size:14px;')} />
              <button onClick={addShoppingItem} style={sx('border:none;background:#4a5d3a;color:#fffaf0;font-weight:700;font-family:Quicksand;font-size:13px;border-radius:12px;padding:0 16px;cursor:pointer;')}>+ Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
