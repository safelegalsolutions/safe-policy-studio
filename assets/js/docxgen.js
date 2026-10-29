/* SAFE Policy Studio — Word (.docx) generator.
 * Writes documents onto the client's letterhead:
 *   - .docx letterhead: header, footer, margins and page setup are kept; the body is replaced
 *   - image letterhead (PNG/JPG): placed full-width in the page header (optional footer image)
 *   - no letterhead: a plain text header with the company name
 * Headings are bold paragraphs, not Word heading styles, so Word shows no collapse arrows. */
(function (root) {
  const S = (root.SAFE = root.SAFE || {});
  const getZip = () => root.JSZip || (typeof require === 'function' ? require('jszip') : null);

  const NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const NS_R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const NS_WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';
  const NS_A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
  const NS_PIC = 'http://schemas.openxmlformats.org/drawingml/2006/picture';

  const x = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    // strip characters not allowed in XML 1.0
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  // ---------------- document composition (blocks) ----------------
  /** Full block list for one document: title, draft banner, document control, body, history. */
  S.composeDocument = (client, doc, opts) => {
    opts = opts || {};
    const r = S.render(client, doc);
    const item = r.item;
    const meta = r.ctx.doc;
    const out = [];
    const isPolicy = item.kind === 'policy';
    out.push({ t: 'title', runs: [{ text: (doc.customTitle || item.title).toUpperCase() }] });
    if (item.kind !== 'template') out.push({ t: 'subtitle', runs: [{ text: client.name || '' }] });
    if (doc.status !== 'Issued' && !opts.noDraftBanner) {
      const st = (doc.status || 'Draft');
      out.push({ t: 'banner', runs: [{ text: st === 'Draft' ? 'DRAFT – NOT FOR CIRCULATION' : 'DRAFT – ' + st.toUpperCase() + ' – NOT FOR CIRCULATION' }] });
    }
    if (isPolicy) {
      const rows = [
        ['Document', doc.customTitle || item.title],
        ['Reference number', doc.ref || ''],
        ['Version', doc.version || ''],
        ['Effective date', S.fmtDate(meta.effectiveDate)],
        ['Next review / expiry', S.fmtDate(meta.expiryDate)],
        ['Policy owner', meta.owner || ''],
        ['Approved by', [meta.approvedBy, meta.approvalDate ? 'on ' + S.fmtDate(meta.approvalDate) : ''].filter(Boolean).join(' ')],
        ['Applies to', meta.appliesTo || ''],
        ['Classification', meta.classification || 'Internal'],
      ].map(([k, v]) => {
        if (v) return [[{ text: k, b: true }], [{ text: v }]];
        const onIssue = (k === 'Effective date' || k === 'Next review / expiry') && doc.status !== 'Issued';
        return [[{ text: k, b: true }], onIssue ? [{ text: 'Set when issued', i: true, color: '7F7F7F' }] : [{ text: '[' + k + ']', hl: true }]];
      });
      out.push({ t: 'table', rows, widths: [0.32, 0.68], header: false, shadeFirstCol: true, small: true });
      out.push({ t: 'spacer' });
    }
    r.blocks.forEach((b) => out.push(b));
    if (isPolicy) {
      const hist = (doc.history || []).filter((h) => h.version && !/^0\./.test(h.version));
      out.push({ t: 'h1', runs: [{ text: 'Version history' }], keep: true });
      const rows = [[[{ text: 'Version', b: true }], [{ text: 'Date', b: true }], [{ text: 'Description of change', b: true }], [{ text: 'Approved by', b: true }]]];
      (hist.length ? hist : [{ version: doc.version, date: meta.effectiveDate, note: 'First issue', approvedBy: meta.approvedBy }]).forEach((h) => {
        rows.push([[{ text: h.version || '' }], [{ text: S.fmtDate(h.date) }], [{ text: h.note || '' }], [{ text: h.approvedBy || '' }]]);
      });
      out.push({ t: 'table', rows, widths: [0.12, 0.2, 0.43, 0.25], header: true, small: true });
    }
    if (item.kind !== 'policy' && doc.ref) {
      out.push({ t: 'p', runs: [{ text: 'Ref: ' + doc.ref + '  |  Version ' + (doc.version || '') , i: true, small: true }], align: 'right' });
    }
    return { blocks: out, blanks: S.countBlanks(out), templateVersion: r.templateVersion };
  };

  /** One compiled playbook: cover, contents, then every document. */
  S.composePlaybook = (client, docs, opts) => {
    opts = opts || {};
    const out = [];
    out.push({ t: 'spacer', big: true });
    out.push({ t: 'title', runs: [{ text: (opts.title || 'Policy Playbook').toUpperCase() }], size: 20 });
    out.push({ t: 'subtitle', runs: [{ text: client.name || '' }], size: 13 });
    out.push({ t: 'spacer' });
    out.push({ t: 'p', align: 'center', runs: [{ text: 'Version ' + (opts.version || '1.0') + '  |  ' + S.fmtDate(opts.date || new Date().toISOString().slice(0, 10)) }] });
    out.push({ t: 'p', align: 'center', runs: [{ text: 'Prepared by SAFE Legal Solutions, Bengaluru', i: true }] });
    out.push({ t: 'pagebreak' });
    out.push({ t: 'h1', runs: [{ text: 'Contents' }] });
    const rows = [[[{ text: 'No.', b: true }], [{ text: 'Document', b: true }], [{ text: 'Reference', b: true }], [{ text: 'Version', b: true }]]];
    docs.forEach((d, i) => {
      const it = S.itemById(d.itemId);
      rows.push([[{ text: String(i + 1) }], [{ text: d.customTitle || it.title }], [{ text: d.ref || '' }], [{ text: d.version || '' }]]);
    });
    out.push({ t: 'table', rows, widths: [0.08, 0.57, 0.23, 0.12], header: true, small: true });
    let blanks = 0;
    docs.forEach((d) => {
      out.push({ t: 'pagebreak' });
      const c = S.composeDocument(client, d, { noDraftBanner: opts.noDraftBanner });
      blanks += c.blanks;
      c.blocks.forEach((b) => out.push(b));
    });
    return { blocks: out, blanks };
  };

  // ---------------- XML writers ----------------
  function runXml(r, st) {
    if (r.br) return '<w:r><w:br/></w:r>';
    if (r.tab) return '<w:r><w:tab/></w:r>';
    const sz = r.size ? r.size * 2 : (r.small || st.small ? st.size * 2 - 2 : st.size * 2);
    let p = '<w:rPr>';
    p += `<w:rFonts w:ascii="${x(st.font)}" w:hAnsi="${x(st.font)}" w:cs="${x(st.font)}" w:eastAsia="${x(st.font)}"/>`;
    if (r.b) p += '<w:b/><w:bCs/>';
    if (r.i) p += '<w:i/><w:iCs/>';
    if (r.color) p += `<w:color w:val="${r.color}"/>`;
    p += `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>`;
    if (r.hl) p += '<w:highlight w:val="yellow"/>';
    p += '</w:rPr>';
    return `<w:r>${p}<w:t xml:space="preserve">${x(r.text)}</w:t></w:r>`;
  }

  function pXml(runs, o, st) {
    o = o || {};
    let pPr = '<w:pPr>';
    if (o.keepNext) pPr += '<w:keepNext/>';
    if (o.keepLines) pPr += '<w:keepLines/>';
    if (o.border) pPr += `<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="2" w:color="${o.border}"/></w:pBdr>`;
    if (o.shd) pPr += `<w:shd w:val="clear" w:color="auto" w:fill="${o.shd}"/>`;
    pPr += `<w:spacing w:before="${o.before || 0}" w:after="${o.after === undefined ? 120 : o.after}" w:line="${o.line || 276}" w:lineRule="auto"/>`;
    if (o.ind) pPr += `<w:ind w:left="${o.ind.left || 0}"${o.ind.hanging ? ` w:hanging="${o.ind.hanging}"` : ''}${o.ind.right ? ` w:right="${o.ind.right}"` : ''}/>`;
    pPr += `<w:jc w:val="${o.jc || 'both'}"/>`;
    pPr += '</w:pPr>';
    return `<w:p>${pPr}${runs.map((r) => runXml(Object.assign({}, o.run || {}, r), st)).join('')}</w:p>`;
  }

  function tableXml(b, st) {
    const W = st.textWidth;
    const n = b.rows.reduce((m, r) => Math.max(m, r.length), 0);
    const fr = b.widths && b.widths.length === n ? b.widths : Array(n).fill(1 / n);
    const cols = fr.map((f) => Math.round(W * f));
    const border = (tag) => `<w:${tag} w:val="single" w:sz="4" w:space="0" w:color="A6A6A6"/>`;
    let out = `<w:tbl><w:tblPr><w:tblW w:w="${W}" w:type="dxa"/><w:tblBorders>${border('top')}${border('left')}${border('bottom')}${border('right')}${border('insideH')}${border('insideV')}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="50" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="50" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr>`;
    out += '<w:tblGrid>' + cols.map((c) => `<w:gridCol w:w="${c}"/>`).join('') + '</w:tblGrid>';
    b.rows.forEach((row, ri) => {
      const isHead = b.header !== false && ri === 0;
      out += '<w:tr><w:trPr><w:cantSplit/>' + (isHead ? '<w:tblHeader/>' : '') + '</w:trPr>';
      for (let ci = 0; ci < n; ci++) {
        const cell = row[ci] || [{ text: '' }];
        let fill = '';
        if (isHead) fill = st.headFill;
        else if (b.shadeFirstCol && ci === 0) fill = 'F2F2F2';
        out += `<w:tc><w:tcPr><w:tcW w:w="${cols[ci]}" w:type="dxa"/>${fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : ''}</w:tcPr>`;
        const runs = cell.map((r) => Object.assign({ small: b.small }, r, isHead ? { b: true, color: st.headText } : {}));
        out += pXml(runs, { after: 0, jc: 'left', line: 252 }, st);
        out += '</w:tc>';
      }
      out += '</w:tr>';
    });
    out += '</w:tbl>';
    return out;
  }

  function blocksXml(blocks, st) {
    const parts = [];
    blocks.forEach((b, i) => {
      const next = blocks[i + 1];
      switch (b.t) {
        case 'title':
          parts.push(pXml(b.runs, { jc: 'center', before: 0, after: 60, keepNext: true, run: { b: true, size: b.size || 15, color: st.accent } }, st)); break;
        case 'subtitle':
          parts.push(pXml(b.runs, { jc: 'center', after: 200, keepNext: true, run: { size: b.size || 11, color: '404040' } }, st)); break;
        case 'banner':
          parts.push(pXml(b.runs, { jc: 'center', after: 200, shd: 'FDE9E7', run: { b: true, size: 9, color: 'C00000' } }, st)); break;
        case 'spacer':
          parts.push(pXml([], { after: b.big ? 2400 : 120 }, st)); break;
        case 'h1':
          parts.push(pXml(b.runs, { before: 240, after: 100, keepNext: true, keepLines: true, jc: 'left', border: st.rule ? st.ruleColor : null, run: { b: true, size: st.size + 1, color: st.accent } }, st)); break;
        case 'h2':
          parts.push(pXml(b.runs, { before: 160, after: 80, keepNext: true, keepLines: true, jc: 'left', run: { b: true } }, st)); break;
        case 'h3':
          parts.push(pXml(b.runs, { before: 120, after: 60, keepNext: true, jc: 'left', run: { b: true, i: true } }, st)); break;
        case 'bullet': {
          const left = b.level ? 1080 : 720;
          parts.push(pXml([{ text: b.level ? '–' : '•' }, { tab: true }].concat(b.runs), { ind: { left, hanging: 360 }, after: 80 }, st)); break;
        }
        case 'clause': {
          const left = 720 * Math.max(1, b.depth);
          const keep = next && (next.t === 'bullet' || next.t === 'clause') && /:\s*$/.test((b.runs[b.runs.length - 1] || {}).text || '');
          parts.push(pXml([{ text: b.num }, { tab: true }].concat(b.runs), { ind: { left, hanging: 720 }, after: 100, keepNext: keep }, st)); break;
        }
        case 'note':
          parts.push(pXml(b.runs, { ind: { left: 720 }, after: 100, run: { color: '595959' } }, st)); break;
        case 'table':
          parts.push(tableXml(b, st)); parts.push(pXml([], { after: 60 }, st)); break;
        case 'pagebreak':
          parts.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>'); break;
        default: {
          const keepNext = !!(next && (next.t === 'bullet' || next.t === 'table') && /:\s*$/.test((b.runs[b.runs.length - 1] || {}).text || ''));
          parts.push(pXml(b.runs || [], { jc: b.align === 'center' ? 'center' : b.align === 'right' ? 'right' : 'both', keepNext }, st));
        }
      }
    });
    return parts.join('');
  }

  // ---------------- packages ----------------
  const twipsToEmu = (t) => Math.round(t * 635);

  function imageParagraph(rid, wTw, hTw, name, ind) {
    const cx = twipsToEmu(wTw), cy = twipsToEmu(hTw);
    return `<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/>${ind ? `<w:ind w:left="${-ind.left}" w:right="${-ind.right}"/>` : ''}<w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${rid === 'rIdImg1' ? 101 : 102}" name="${x(name)}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="${NS_A}" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="${NS_A}"><a:graphicData uri="${NS_PIC}"><pic:pic xmlns:pic="${NS_PIC}"><pic:nvPicPr><pic:cNvPr id="0" name="${x(name)}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  }

  function pageFieldRuns(st) {
    const f = (code) => `<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> ${code} </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>${runXml({ text: '1', small: true, color: '7F7F7F' }, st)}<w:r><w:fldChar w:fldCharType="end"/></w:r>`;
    return runXml({ text: 'Page ', small: true, color: '7F7F7F' }, st) + f('PAGE') + runXml({ text: ' of ', small: true, color: '7F7F7F' }, st) + f('NUMPAGES');
  }

  const extOf = (mime) => (/png/i.test(mime) ? 'png' : 'jpeg');

  async function freshPackage(lh, st, companyName) {
    const JSZip = getZip();
    const zip = new JSZip();
    const PW = 11906, PH = 16838; // A4
    const margin = { top: 1440, right: 1260, bottom: 1300, left: 1260 };
    let headerXml, footerXml;
    const hRels = [], fRels = [];
    let headerDist = 567, footerDist = 450;
    if (lh && lh.kind === 'image' && lh.data) {
      const ext = extOf(lh.mime);
      zip.file('word/media/letterhead.' + ext, lh.data);
      hRels.push(`<Relationship Id="rIdImg1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/letterhead.${ext}"/>`);
      const ratio = (lh.height || 1) / (lh.width || 1);
      const full = lh.fullBleed !== false;
      const wTw = full ? PW : PW - margin.left - margin.right;
      const hTw = Math.round(wTw * ratio);
      headerDist = full ? 0 : 400;
      margin.top = Math.max(1200, headerDist + hTw + 240);
      headerXml = imageParagraph('rIdImg1', wTw, hTw, 'Letterhead', full ? { left: margin.left, right: margin.right } : null);
    } else {
      headerXml = pXml([{ text: companyName || '', b: true, color: st.accent, size: 12 }], { jc: 'left', after: 0, border: st.accent }, st);
    }
    if (lh && lh.footer && lh.footer.data) {
      const ext = extOf(lh.footer.mime);
      zip.file('word/media/footer.' + ext, lh.footer.data);
      fRels.push(`<Relationship Id="rIdImg2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/footer.${ext}"/>`);
      const ratio = (lh.footer.height || 1) / (lh.footer.width || 1);
      const full = lh.fullBleed !== false;
      const wTw = full ? PW : PW - margin.left - margin.right;
      const hTw = Math.round(wTw * ratio);
      footerDist = full ? 0 : 300;
      margin.bottom = Math.max(1200, footerDist + hTw + 500);
      footerXml = `<w:p><w:pPr><w:spacing w:after="60"/><w:jc w:val="center"/></w:pPr>${pageFieldRuns(st)}</w:p>` + imageParagraph('rIdImg2', wTw, hTw, 'Footer', full ? { left: margin.left, right: margin.right } : null);
    } else {
      footerXml = `<w:p><w:pPr><w:spacing w:after="0"/><w:jc w:val="center"/></w:pPr>${pageFieldRuns(st)}</w:p>`;
    }
    const hdrNs = `xmlns:w="${NS_W}" xmlns:r="${NS_R}" xmlns:wp="${NS_WP}"`;
    zip.file('word/header1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ${hdrNs}>${headerXml}</w:hdr>`);
    zip.file('word/footer1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ${hdrNs}>${footerXml}</w:ftr>`);
    zip.file('word/_rels/header1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${hRels.join('')}</Relationships>`);
    zip.file('word/_rels/footer1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${fRels.join('')}</Relationships>`);
    zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>');
    zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>');
    zip.file('word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>');
    zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="${NS_W}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${x(st.font)}" w:hAnsi="${x(st.font)}" w:cs="${x(st.font)}" w:eastAsia="${x(st.font)}"/><w:sz w:val="${st.size * 2}"/><w:szCs w:val="${st.size * 2}"/><w:lang w:val="en-IN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>`);
    zip.file('word/settings.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="${NS_W}"><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`);
    const sectPr = `<w:sectPr><w:headerReference w:type="default" r:id="rId3"/><w:footerReference w:type="default" r:id="rId4"/><w:pgSz w:w="${PW}" w:h="${PH}"/><w:pgMar w:top="${margin.top}" w:right="${margin.right}" w:bottom="${margin.bottom}" w:left="${margin.left}" w:header="${headerDist}" w:footer="${footerDist}" w:gutter="0"/><w:cols w:space="708"/></w:sectPr>`;
    const head = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${NS_W}" xmlns:r="${NS_R}" xmlns:wp="${NS_WP}"><w:body>`;
    return { zip, head, tail: sectPr + '</w:body></w:document>', preserved: '', textWidth: PW - margin.left - margin.right };
  }

  async function letterheadPackage(lh, st) {
    const JSZip = getZip();
    const zip = await JSZip.loadAsync(lh.data);
    const f = zip.file('word/document.xml');
    if (!f) throw new Error('The letterhead file is not a valid Word document.');
    const xml = await f.async('string');
    const bm = /<w:body[^>]*>/.exec(xml);
    const end = xml.lastIndexOf('</w:body>');
    if (!bm || end < 0) throw new Error('Could not read the letterhead body.');
    const bodyStart = bm.index + bm[0].length;
    const inner = xml.slice(bodyStart, end);
    const si = inner.lastIndexOf('<w:sectPr');
    const sectPr = si >= 0 ? inner.slice(si) : '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>';
    let preserved = si >= 0 ? inner.slice(0, si) : inner;
    const mode = lh.bodyMode || 'auto';
    const hasGraphics = /<w:drawing|<w:pict|<mc:AlternateContent|<w:txbxContent/.test(preserved);
    if (mode === 'discard' || (mode === 'auto' && !hasGraphics)) preserved = '';
    // strip trailing empty paragraphs from preserved content
    for (let k = 0; k < 30; k++) {
      const m = /(<w:p\b[^>]*\/>|<w:p\b[^>]*>((?:(?!<w:p\b)[\s\S])*?)<\/w:p>)\s*$/.exec(preserved);
      if (!m || /<w:t[ >]|<w:drawing|<w:pict|<w:sectPr|<mc:AlternateContent/.test(m[0])) break;
      preserved = preserved.slice(0, m.index);
    }
    const pg = /<w:pgSz[^>]*w:w="(\d+)"/.exec(sectPr);
    const ml = /<w:pgMar[^>]*w:left="(\d+)"/.exec(sectPr);
    const mr = /<w:pgMar[^>]*w:right="(\d+)"/.exec(sectPr);
    const textWidth = (pg ? +pg[1] : 11906) - (ml ? +ml[1] : 1440) - (mr ? +mr[1] : 1440);
    // remove comments/tracked changes parts? Keep the package as-is otherwise.
    return { zip, head: xml.slice(0, bodyStart), tail: sectPr + xml.slice(end), preserved, textWidth };
  }

  /** Build a .docx. opts: { letterhead, font, size, accent, companyName, title, output: 'blob'|'uint8array'|'nodebuffer' } */
  S.buildDocx = async (blocks, opts) => {
    opts = opts || {};
    const st = {
      font: opts.font || 'Calibri', size: opts.size || 11, accent: (opts.accent || '1F3864').replace('#', ''),
      headFill: (opts.headFill || 'D9E2F3').replace('#', ''), headText: '000000', rule: true,
      ruleColor: (opts.ruleColor || 'BFBFBF').replace('#', ''),
    };
    const lh = opts.letterhead;
    const pkg = lh && lh.kind === 'docx' && lh.data ? await letterheadPackage(lh, st) : await freshPackage(lh, st, opts.companyName);
    st.textWidth = pkg.textWidth;
    const body = pkg.preserved + blocksXml(blocks, st);
    pkg.zip.file('word/document.xml', pkg.head + body + pkg.tail);
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    pkg.zip.file('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${x(opts.title || '')}</dc:title><dc:creator>SAFE Legal Solutions</dc:creator><cp:lastModifiedBy>SAFE Policy Studio</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`);
    // make sure a letterhead package declares core.xml
    if (lh && lh.kind === 'docx') {
      let ct = await pkg.zip.file('[Content_Types].xml').async('string');
      if (!/docProps\/core\.xml/.test(ct)) {
        ct = ct.replace('</Types>', '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>');
        pkg.zip.file('[Content_Types].xml', ct);
        let rels = await pkg.zip.file('_rels/.rels').async('string');
        if (!/core-properties/.test(rels)) rels = rels.replace('</Relationships>', '<Relationship Id="rIdCore9" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>');
        pkg.zip.file('_rels/.rels', rels);
      }
    }
    return pkg.zip.generateAsync({ type: opts.output || 'blob', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  };
})(typeof window !== 'undefined' ? window : globalThis);
