import React, { useEffect, useMemo, useRef } from "react";

/** =========================
 *  Types (adapte si besoin)
 *  ========================= */
export type PurchaseOrderLine = {
  code?: string;
  qty?: number;
  designation: string;
  unitPriceHT?: number;
  totalHT?: number; // si non fourni, calculé (qty * unitPriceHT)
};

export type PurchaseOrderParty = {
  company?: string;
  contact?: string;
  address1?: string;
  address2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  fax?: string;
  vatNumber?: string;
};

export type PurchaseOrderMeta = {
  number?: string;
  date?: string; // idéalement ISO ou "JJ/MM/AAAA"
  yourName?: string;
  yourRole?: string;
  paymentMethod?: string;
  signature?: string;
};

export type PurchaseOrderData = {
  meta: PurchaseOrderMeta;
  supplier: PurchaseOrderParty; // fournisseur
  customer?: PurchaseOrderParty; // client (optionnel si tu veux 2 grands blocs)
  delivery?: PurchaseOrderParty; // adresse de livraison (si différente)
  lines: PurchaseOrderLine[];
  vatRate?: number; // ex: 0.196 pour 19,6%
  currency?: string; // "FCFA", "€", etc.
  notesBandText?: string; // texte sur la bande rouge
  logoText?: string; // "Votre Logo" (ou image en base64 si tu veux)
};

/** =========================
 *  Utilitaires
 *  ========================= */
function escapeHtml(input: string) {
  return (input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value: number, currency = "FCFA") {
  if (!Number.isFinite(value)) return "";
  // Affichage simple et stable (tu peux passer à Intl.NumberFormat si tu veux)
  const v = Math.round(value * 100) / 100;
  return `${v.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

function partyLines(p?: PurchaseOrderParty) {
  if (!p) return [];
  const lines: string[] = [];
  if (p.company) lines.push(p.company);
  if (p.contact) lines.push(p.contact);
  if (p.address1) lines.push(p.address1);
  if (p.address2) lines.push(p.address2);
  const cityLine = [p.postalCode, p.city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  if (p.country) lines.push(p.country);
  return lines;
}

function buildBonDeCommandeHtml(data: PurchaseOrderData) {
  const vatRate = Number.isFinite(data.vatRate!) ? (data.vatRate as number) : 0.196;
  const currency = data.currency ?? "FCFA";

  const computedLines = (data.lines ?? []).map((l) => {
    const qty = Number.isFinite(l.qty!) ? (l.qty as number) : undefined;
    const up = Number.isFinite(l.unitPriceHT!) ? (l.unitPriceHT as number) : undefined;
    const total = Number.isFinite(l.totalHT!)
      ? (l.totalHT as number)
      : qty != null && up != null
        ? qty * up
        : undefined;

    return { ...l, qty, unitPriceHT: up, totalHT: total };
  });

  const totalHT = computedLines.reduce((acc, l) => acc + (l.totalHT ?? 0), 0);
  const totalTVA = totalHT * vatRate;
  const totalTTC = totalHT + totalTVA;

  // Pour une grille "papier" stable : on force un nombre de lignes (ex: 16)
  const TARGET_ROWS = 16;
  const rows = [...computedLines];
  while (rows.length < TARGET_ROWS) {
    rows.push({ 
      designation: "",
      qty: undefined,
      unitPriceHT: undefined,
      totalHT: undefined
    });
  }

  const bandText =
    data.notesBandText ?? "Indications et informations particulières destinées à votre client.";

  const customerBox = partyLines(data.customer);
  const supplierBox = partyLines(data.supplier);

  const delivery = data.delivery;
  const deliveryText = partyLines(delivery).join("<br/>");

  const supplierRight = data.supplier ?? {};
  const supplierCompany = escapeHtml(supplierRight.company ?? "");
  const supplierAddress = escapeHtml(
    [supplierRight.address1, supplierRight.address2, [supplierRight.postalCode, supplierRight.city].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", ")
  );

  const phone = escapeHtml(supplierRight.phone ?? "");
  const fax = escapeHtml(supplierRight.fax ?? "");

  const meta = data.meta ?? {};

  // IMPORTANT : styles encapsulés ici (aucun CSS global)
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Bon de commande</title>
  <style>
    /* Reset local */
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      background: #f2f3f5;
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      cursor: default;              /* ✅ pas de curseur "édition" */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .wrap {
      padding: 16px;
      display: flex;
      justify-content: center;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      background: #fff;
      border: 1px solid #cfcfcf;
      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      padding: 10mm;
    }

    .topbar {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .logoBox {
      border: 1px solid #000;
      padding: 4px 8px;
      width: fit-content;
      font-weight: 700;
      font-size: 16px;
      background: #fff;
    }
    .title {
      text-align: left;
      font-weight: 800;
      font-size: 22px;
      color: #d10000;
      letter-spacing: 0.4px;
    }

    .metaBox {
      border: 1px solid #000;
      padding: 6px 8px;
      font-size: 11px;
      margin-bottom: 6px;
    }
    .metaRow {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 4px;
    }
    .field {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 6px;
      align-items: end;
    }
    .label { white-space: nowrap; }
    .line {
      border-bottom: 1px solid #000;
      height: 14px;
      display: flex;
      align-items: end;
      padding-bottom: 1px;
      overflow: hidden;
    }

    .twoBoxes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 6px;
    }
    .bigBox {
      border: 1px solid #000;
      height: 78px;
      padding: 6px;
      font-size: 11px;
      line-height: 1.25;
    }

    .deliveryRow {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 12px;
      align-items: start;
      margin: 6px 0;
    }
    .deliveryBox {
      font-size: 10.5px;
      line-height: 1.25;
      padding-top: 2px;
    }
    .deliveryTitle {
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .supplierMini {
      font-size: 10.5px;
      line-height: 1.25;
    }
    .miniLine {
      display: grid;
      grid-template-columns: 70px 1fr;
      gap: 6px;
      margin-bottom: 3px;
      align-items: end;
    }
    .miniValue {
      border-bottom: 1px solid #000;
      height: 14px;
      overflow: hidden;
      display: flex;
      align-items: end;
      padding-bottom: 1px;
    }

    .band {
      background: #d10000;
      color: #fff;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 700;
      margin: 6px 0 4px 0;
    }

    table.items {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    table.items th, table.items td {
      border: 1px solid #000;
      padding: 4px 6px;
      vertical-align: top;
    }
    table.items th {
      font-weight: 700;
      background: #fff;
    }
    .col-code { width: 12%; }
    .col-qty  { width: 12%; text-align: center; }
    .col-des  { width: 46%; }
    .col-up   { width: 15%; text-align: right; }
    .col-tot  { width: 15%; text-align: right; }

    .bottom {
      display: grid;
      grid-template-columns: 1fr 0.42fr;
      gap: 14px;
      margin-top: 8px;
      align-items: end;
    }
    .checks {
      font-size: 10.5px;
      line-height: 1.35;
    }
    .checkLine {
      display: flex;
      gap: 6px;
      align-items: baseline;
      color: #b30000;
      margin: 2px 0;
    }
    .boxSmall {
      border: 1px solid #000;
      width: 10px;
      height: 10px;
      display: inline-block;
      margin-top: 2px;
      flex: 0 0 auto;
      background: #fff;
    }
    .addrSmall {
      border: 1px solid #000;
      height: 44px;
      margin-top: 6px;
      padding: 6px;
      color: #111;
    }

    .totals {
      border: 1px solid #000;
      padding: 6px 8px;
      font-size: 11px;
    }
    .totalRow {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      margin-bottom: 4px;
      align-items: end;
    }
    .totalLabel { text-align: right; }
    .totalValue { text-align: right; min-width: 120px; }

    @media print {
      body { background: #fff; }
      .wrap { padding: 0; }
      .page { border: none; box-shadow: none; padding: 10mm; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="page" aria-label="Bon de commande">
      <div class="topbar">
        <div class="logoBox">${escapeHtml(data.logoText ?? "Votre Logo")}</div>
        <div class="title">BON DE COMMANDE</div>
      </div>

      <div class="metaBox">
        <div class="metaRow">
          <div class="field">
            <div class="label">Bon de commande N° :</div>
            <div class="line">${escapeHtml(meta.number ?? "")}</div>
          </div>
          <div class="field">
            <div class="label">Date :</div>
            <div class="line">${escapeHtml(meta.date ?? "")}</div>
          </div>
        </div>
        <div class="metaRow">
          <div class="field">
            <div class="label">Votre nom :</div>
            <div class="line">${escapeHtml(meta.yourName ?? "")}</div>
          </div>
          <div class="field">
            <div class="label">Fonction :</div>
            <div class="line">${escapeHtml(meta.yourRole ?? "")}</div>
          </div>
        </div>
        <div class="metaRow">
          <div class="field">
            <div class="label">Téléphone :</div>
            <div class="line">${escapeHtml(data.customer?.phone ?? "")}</div>
          </div>
          <div class="field">
            <div class="label">N° TVA intracommunautaire :</div>
            <div class="line">${escapeHtml(data.customer?.vatNumber ?? "")}</div>
          </div>
        </div>
        <div class="metaRow">
          <div class="field">
            <div class="label">Mode de règlement :</div>
            <div class="line">${escapeHtml(meta.paymentMethod ?? "")}</div>
          </div>
          <div class="field">
            <div class="label">Signature :</div>
            <div class="line">${escapeHtml(meta.signature ?? "")}</div>
          </div>
        </div>
      </div>

      <div class="twoBoxes">
        <div class="bigBox">
          ${customerBox.map((x) => escapeHtml(x)).join("<br/>")}
        </div>
        <div class="bigBox">
          ${supplierBox.map((x) => escapeHtml(x)).join("<br/>")}
        </div>
      </div>

      <div class="deliveryRow">
        <div class="deliveryBox">
          <div class="deliveryTitle">ADRESSE DE LIVRAISON <span style="font-weight:400; text-transform:none;">(si diff.)</span></div>
          <div>${deliveryText || "&nbsp;"}</div>
        </div>

        <div class="supplierMini">
          <div class="miniLine"><div>Société :</div><div class="miniValue">${supplierCompany}</div></div>
          <div class="miniLine"><div>Adresse :</div><div class="miniValue">${supplierAddress}</div></div>
          <div class="miniLine"><div>Téléphone :</div><div class="miniValue">${phone}</div></div>
          <div class="miniLine"><div>Télécopie :</div><div class="miniValue">${fax}</div></div>
        </div>
      </div>

      <div class="band">${escapeHtml(bandText)}</div>

      <table class="items" aria-label="Lignes de commande">
        <thead>
          <tr>
            <th class="col-code">Code</th>
            <th class="col-qty">Quantité</th>
            <th class="col-des">Désignation Article</th>
            <th class="col-up">Prix Unitaire HT</th>
            <th class="col-tot">Prix Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((r) => {
              const code = escapeHtml(r.code ?? "");
              const qty = r.qty != null ? escapeHtml(String(r.qty)) : "";
              const des = escapeHtml(r.designation ?? "");
              const up = r.unitPriceHT != null ? escapeHtml(formatMoney(r.unitPriceHT, currency)) : "";
              const tot = r.totalHT != null ? escapeHtml(formatMoney(r.totalHT, currency)) : "";
              return `<tr>
                <td class="col-code">${code || "&nbsp;"}</td>
                <td class="col-qty">${qty || "&nbsp;"}</td>
                <td class="col-des">${des || "&nbsp;"}</td>
                <td class="col-up">${up || "&nbsp;"}</td>
                <td class="col-tot">${tot || "&nbsp;"}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>

      <div class="bottom">
        <div class="checks">
          <div class="checkLine"><span class="boxSmall"></span><span>Qui a souhaité recevoir un exemplaire<br/>de votre catalogue Général 2000.</span></div>
          <div class="checkLine"><span class="boxSmall"></span><span>Veuillez envoyer de ma part votre<br/>catalogue Général 2000 à :</span></div>
          <div class="addrSmall">&nbsp;</div>
        </div>

        <div class="totals" aria-label="Totaux">
          <div class="totalRow">
            <div class="totalLabel">Total HT :</div>
            <div class="totalValue">${escapeHtml(formatMoney(totalHT, currency))}</div>
          </div>
          <div class="totalRow">
            <div class="totalLabel">T.V.A ${(vatRate * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })}% :</div>
            <div class="totalValue">${escapeHtml(formatMoney(totalTVA, currency))}</div>
          </div>
          <div class="totalRow" style="font-weight:700;">
            <div class="totalLabel">Total TTC :</div>
            <div class="totalValue">${escapeHtml(formatMoney(totalTTC, currency))}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;
}

/** =========================
 *  Composant isolé (iframe)
 *  ========================= */
export function BonDeCommandePreview({
  data,
  height = 900,
  className,
}: {
  data: PurchaseOrderData;
  height?: number;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const html = useMemo(() => buildBonDeCommandeHtml(data), [data]);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      className={className}
      style={{
        width: "100%",
        height,
        border: "0",
        borderRadius: 12,
        overflow: "hidden",
        background: "transparent",
      }}
      // sandbox pour isolation (et garder le print possible)
      sandbox="allow-same-origin allow-scripts allow-modals"
      title="Aperçu Bon de Commande"
    />
  );
}

/** Optionnel: bouton d'impression (PDF via navigateur) */
export function BonDeCommandePrintButton({
  targetIframeRef,
  label = "Imprimer / Export PDF",
}: {
  targetIframeRef: React.RefObject<HTMLIFrameElement>;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        const win = targetIframeRef.current?.contentWindow;
        win?.focus();
        win?.print();
      }}
    >
      {label}
    </button>
  );
}

