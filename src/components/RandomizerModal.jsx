import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function RandomizerModal({ onClose }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ids, setIds] = useState([]);

  useEffect(() => {
    supabase.from("recipes").select("id").then(({ data, error }) => {
      if (error || !data?.length) { setError("No recipes found."); return; }
      const shuffled = data.map(r => r.id).sort(() => Math.random() - 0.5);
      setIds(shuffled);
      pick(shuffled, 0);
    });
  }, []);

  async function pick(idList = ids, startIdx = 0) {
    if (!idList.length) return;
    setLoading(true);
    setError("");
    setRecipe(null);
    const idx = startIdx % idList.length;
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", idList[idx])
      .single();
    if (error) setError("Couldn't load recipe.");
    else setRecipe(data);
    setIds(prev => {
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
    setLoading(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{
        width: "100%", maxWidth: 520, maxHeight: "80vh",
        overflowY: "auto", position: "relative",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>🎲 Surprise Me</div>
          <button className="btn btn--ghost" style={{ padding: "4px 10px" }} onClick={onClose}>✕</button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            Shaking things up…
          </div>
        )}

        {error && <div style={{ color: "#c05050", fontSize: "0.88rem" }}>{error}</div>}

        {recipe && !loading && (
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 4 }}>{recipe.name}</h2>
            {recipe.glassware && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
                {recipe.glassware}
              </div>
            )}

            <div className="section-title">Ingredients</div>
            <ul style={{ margin: "0 0 20px", padding: "0 0 0 18px", lineHeight: 1.9, fontSize: "0.9rem" }}>
              {(recipe.ingredients || []).map((ing, i) => (
                <li key={i}>
                  {typeof ing === "string" ? ing
                    : [ing.amount, ing.unit, ing.ingredient].filter(Boolean).join(" ")}
                </li>
              ))}
            </ul>

            <div className="section-title">Method</div>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--text-muted)", marginBottom: 20 }}>
              {recipe.instructions}
            </p>

            {recipe.garnish && (
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
                <strong style={{ color: "var(--text)" }}>Garnish:</strong> {recipe.garnish}
              </div>
            )}

            {recipe.notes && (
              <div style={{
                fontSize: "0.82rem", color: "var(--text-muted)", borderTop: "1px solid var(--border)",
                paddingTop: 14, lineHeight: 1.6,
              }}>
                {recipe.notes}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn--ghost" onClick={onClose}>Close</button>
          <button className="btn btn--primary" onClick={() => pick()} disabled={loading || !ids.length}>
            {ids.length === 0 ? "All done!" : "Pick Another"}
          </button>
        </div>
      </div>
    </div>
  );
}
