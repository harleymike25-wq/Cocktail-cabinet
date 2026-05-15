import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const QUALITY_COLOR = {
  exact: "var(--green)",
  good: "var(--amber)",
  acceptable: "var(--text-muted)",
};

function AlmostCard({ suggestion }) {
  return (
    <div className="card" style={{ borderColor: "rgba(100,80,40,0.4)" }}>
      <div style={{ fontWeight: 500 }}>{suggestion.name}</div>
      <div style={{ fontSize: "0.82rem", color: "var(--amber)", marginTop: 4 }}>
        Missing: {suggestion.missing?.join(", ")}
      </div>
      {suggestion.have?.length > 0 && (
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
          Have: {suggestion.have.join(", ")}
        </div>
      )}
      {suggestion.explanation && (
        <div style={{ marginTop: 10, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          {suggestion.explanation}
        </div>
      )}
    </div>
  );
}

function CanMakeCard({ suggestion }) {
  const [open, setOpen] = useState(false);
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    if (!open || recipe) return;
    supabase.from("recipes").select("*").ilike("name", suggestion.name).single()
      .then(({ data }) => { if (data) setRecipe(data); });
  }, [open]);

  return (
    <div className="card" style={{ cursor: "pointer" }} onClick={() => setOpen((v) => !v)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 500 }}>{suggestion.name}</div>
          {suggestion.match_quality && (
            <div style={{ fontSize: "0.78rem", color: QUALITY_COLOR[suggestion.match_quality] || "var(--text-muted)", marginTop: 2 }}>
              {suggestion.match_quality} match
            </div>
          )}
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
          {suggestion.explanation && (
            <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.65 }}>
              {suggestion.explanation}
            </div>
          )}
          {suggestion.substitutions?.length > 0 && (
            <div style={{ fontSize: "0.82rem", color: "var(--amber)", marginBottom: 10 }}>
              Sub: {suggestion.substitutions.join("; ")}
            </div>
          )}

          {recipe && (
            <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              {recipe.glassware && (
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10 }}>
                  Glass: {recipe.glassware}
                </div>
              )}
              <div className="section-title">Ingredients</div>
              <ul style={{ margin: "0 0 14px", padding: "0 0 0 16px", fontSize: "0.87rem", lineHeight: 1.9 }}>
                {(recipe.ingredients || []).map((ing, i) => (
                  <li key={i}>
                    {typeof ing === "string" ? ing
                      : [ing.amount, ing.unit, ing.ingredient].filter(Boolean).join(" ")}
                    {ing.optional ? " (optional)" : ""}
                  </li>
                ))}
              </ul>
              <div className="section-title">Method</div>
              <p style={{ fontSize: "0.87rem", color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 10px" }}>
                {recipe.instructions}
              </p>
              {recipe.garnish && (
                <div style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>
                  <strong style={{ color: "var(--text)" }}>Garnish:</strong> {recipe.garnish}
                </div>
              )}
              {suggestion.recipe_highlight && (
                <div style={{ fontSize: "0.82rem", color: "var(--amber)", marginTop: 10, fontStyle: "italic" }}>
                  Tip: {suggestion.recipe_highlight}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SuggestionCard({ suggestion, type }) {
  if (type === "almost") return <AlmostCard suggestion={suggestion} />;
  return <CanMakeCard suggestion={suggestion} />;
}
