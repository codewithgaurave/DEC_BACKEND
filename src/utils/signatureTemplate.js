/**
 * DEC Email Signature HTML Generator
 * - Static: Company Logo & Gold Framing Lines
 * - Fully Dynamic:
 *   - Multiple Certification Logos (spread evenly across full width, proportional sizing)
 *   - Grade / Classification (styled text or image banner)
 *   - Employee Identity, Contacts & Confidentiality Disclaimer
 */

import { EMBEDDED_DEFAULT_CERT_LOGOS } from './certAssets.js'

export const LINEBAR_PNG_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjAAAAAICAYAAADnR8WGAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAkUlEQVR4nO3YsQ0AIQwDQCbyrCyU2WAGqs9HV7hHzilCWbVzRAcMMMAAAwwwUD/qYH39ANEBAwwwwAADDJQPDAQWAQMMMMAAAzW8AxeYBkMQHTDAAAMMMBAfGAgsAgYYYIABBjK6AxeYBkMQHTDAAAMMMBAfGAgsAgYYYIABBjK6AxeYBkMQHTDAAAMMMJCnDi4noFmGvZ9b+AAAAABJRU5ErkJggg=='

export const DEFAULT_CERTIFICATION_LOGOS = EMBEDDED_DEFAULT_CERT_LOGOS

export const generateSignatureHtml = (data = {}) => {
  const {
    name = '',
    qualifications = '',
    designation = '',
    mobile = '',
    telephone = '',
    email = '',
    address = 'Office 704, Manarat Lusail Tower, Qatar',
    addressUrl = 'https://maps.app.goo.gl/zHL4LceLwR4XPNbF6?g_st=iwb',
    website = 'www.desentralqatar.com',
    websiteUrl = 'https://desentralqatar.com/',
    linkedin = 'LinkedIn',
    linkedinUrl = 'https://www.linkedin.com/company/desentral-engineering-consultancy/',
    // Dynamic Grade / Classification Controls
    showGradeBadge = true,
    gradeType = 'image', // 'image' | 'text'
    gradeTextPrefix = 'Grade A',
    gradeTextSuffix = 'Multidisciplinary Engineering Consultancy',
    gradeBadgeUrl = 'https://taxcaresolution.com/wp-content/uploads/2026/08/Grade-Text-New.png',
    // Multiple Dynamic Certification Logos
    showCertifications = true,
    certificationLogos = DEFAULT_CERTIFICATION_LOGOS,
    certLogoHeight = 28,
    certificationsUrl = 'https://taxcaresolution.com/wp-content/uploads/2026/08/Certifications-logos-new.jpg',
    showCustomAuthorityLogo = false,
    customAuthorityLogoUrl = '',
    // Company Logo (Static default)
    companyLogoUrl = 'https://taxcaresolution.com/wp-content/uploads/2026/08/DEC-new-final.jpg',
    disclaimer = 'The content of this email is confidential and intended for the recipient specified in message only. It is strictly forbidden to share any part of this message with any third party, without a written consent of the sender. If you received this message by mistake, please reply to this message and follow with its deletion, so that we can ensure such a mistake does not occur in the future.',
  } = data

  const mobileClean = mobile ? mobile.replace(/[^0-9+]/g, '') : ''
  const telephoneClean = telephone ? telephone.replace(/[^0-9+]/g, '') : ''

  // Build Certifications Row (Multiple Logos spread across full width)
  let certsMarkup = ''
  if (showCertifications) {
    if (Array.isArray(certificationLogos) && certificationLogos.length > 0) {
      const validCerts = certificationLogos.filter((c) => c && c.url)
      const totalCerts = validCerts.length || 1
      const cellWidthPercent = (100 / totalCerts).toFixed(1)
      const logoHeight = Math.max(16, Math.min(42, parseInt(certLogoHeight, 10) || 28))

      certsMarkup = `
        <table width="248" cellpadding="0" cellspacing="0" border="0" align="center" style="width:248px;max-width:248px;margin:8px auto 0 auto;border-collapse:collapse;table-layout:fixed;">
          <tr style="vertical-align:middle;">
            ${validCerts
              .map(
                (cert) => `
              <td align="center" valign="middle" width="${cellWidthPercent}%" style="width:${cellWidthPercent}%;padding:0 3px;vertical-align:middle;line-height:normal;text-align:center;">
                <img border="0" src="${cert.url}" alt="${escapeXml(cert.name || 'Cert')}" height="${logoHeight}" style="height:${logoHeight}px;max-height:${logoHeight}px;width:auto;max-width:100%;display:block;margin:0 auto;object-fit:contain;vertical-align:middle;">
              </td>
            `
              )
              .join('')}
          </tr>
        </table>
      `
    } else if (certificationsUrl) {
      certsMarkup = `<br><img border="0" width="240" src="${certificationsUrl}" alt="Authority Certifications" style="display:inline-block;margin-top:4px;max-width:240px;height:auto;">`
    }
  }

  // Build Grade markup
  let gradeMarkup = ''
  if (showGradeBadge) {
    if (gradeType === 'text') {
      gradeMarkup = `
        <div style="font-family:'Open Sans',Arial,sans-serif;font-size:11px;font-weight:bold;line-height:14px;color:#030303;white-space:nowrap;margin-top:4px;text-align:center;">
          <span style="color:#bd902e;">${escapeXml(gradeTextPrefix || 'Grade A')}</span>
          <span style="color:#030303;"> | ${escapeXml(gradeTextSuffix || 'Multidisciplinary Engineering Consultancy')}</span>
        </div>
      `
    } else {
      gradeMarkup = `<br><img border="0" width="260" src="${gradeBadgeUrl}" alt="Accreditation Grade" style="display:inline-block;margin-top:4px;max-width:260px;height:auto;">`
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Email Signature - ${escapeXml(name || 'DEC')}</title>
    <style type='text/css'>
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');
        a{margin:0;padding:0;border:none !important;text-decoration:none !important;}
        table,tr,td,a,span{font-family: 'Open Sans', Arial, sans-serif;}
    </style>
</head>
<body>
    <table width="560" style="width:560px;font-family: 'Open Sans', Arial, sans-serif;line-height:normal" cellspacing="0" cellpadding="0" border="0">
        <tbody>
            <tr>
                <td width="560">
                    <table width="560" cellspacing="0" cellpadding="0" border="0">
                        <tbody>
                            <tr>
                                <td width="260" align="center" valign="middle" style="line-height:12pt;padding-right: 20px;border-right: 1px solid #bd902e;vertical-align:middle;padding-top: 5px;">
                                    <!-- Static DEC Company Logo -->
                                    <img border="0" width="220" src="${companyLogoUrl}" alt="DEC Logo" style="display:block;margin:0 auto;max-width:220px;height:auto;">
                                    <!-- Dynamic Grade / Classification -->
                                    ${gradeMarkup}
                                    <!-- Dynamic Multiple Certification Logos (Spread evenly across full width) -->
                                    ${certsMarkup}
                                    <!-- Optional 3rd Authority / Partner Logo -->
                                    ${showCustomAuthorityLogo && customAuthorityLogoUrl ? `<br><img border="0" width="240" src="${customAuthorityLogoUrl}" alt="Authority Partner" style="display:inline-block;margin-top:4px;max-height:28px;width:auto;max-width:240px;object-fit:contain;">` : ''}
                                </td>
                                <td width="260" valign="middle" style="vertical-align:middle;padding-left: 20px;">
                                    <table width="260" cellpadding="0" cellspacing="0" style="padding:0;margin:0">
                                        <tr>
                                            <td valign="top" style="line-height: 18px;border-bottom: 1px solid #bd902e;padding-bottom:4px;">
                                                <span style="font-family: 'Open Sans', Arial, sans-serif; line-height: 18px; font-size: 14px; color: #bd902e; font-weight: bold;">${escapeXml(name)}</span>${qualifications ? `<span style="font-family: 'Open Sans', Arial, sans-serif; line-height: 18px; font-size: 14px; color: #030303; font-weight: bold;"> | ${escapeXml(qualifications)}</span>` : ''}<br>
                                                <span style="font-family: 'Open Sans', Arial, sans-serif; line-height: 18px; font-size: 11px; color: #030303; font-weight: normal;">${escapeXml(designation)}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td width="260" style="padding-top:5px;line-height:14px;">
                                                <table width="260" cellpadding="0" cellspacing="0" style="padding:0;margin:0;line-height:14px;">
                                                    ${mobile ? `<tr height="20" style="vertical-align: middle;">
                                                        <td width="21" style="vertical-align: middle;">
                                                        <table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle;  font-family:  'Open Sans', Arial, sans-serif;line-height:14px;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="vertical-align: bottom;"><span width="12" class="sc-jlyJG bbyJzT" style="display: block;"><img src="https://iili.io/frciUu9.png" color="#3a975b" width="14" height="14" class="sc-iRbamj blSEcj" style="display: block;"></span></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        </td>
                                                        <td style="padding: 0px;line-height:14px;"><a href="tel:${mobileClean || mobile}" style="text-decoration: none; color: #ffffff;line-height:16px; font-size: 11px;font-family: 'Open Sans', Arial, sans-serif;"><span style="text-decoration: none;line-height:16px; font-family: 'Open Sans', Arial, sans-serif;color: #030303; font-size: 11px;font-weight: normal;">${escapeXml(mobile)}</span></a></td>
                                                    </tr>` : ''}
                                                    ${telephone ? `<tr height="20" style="vertical-align: middle;">
                                                        <td width="21" style="vertical-align: middle;">
                                                        <table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle;  font-family:  'Open Sans', Arial, sans-serif;line-height:14px;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="vertical-align: bottom;"><span width="12" class="sc-jlyJG bbyJzT" style="display: block;"><img src="https://iili.io/f49Q3Kl.png" color="#3a975b" width="13" height="13" class="sc-iRbamj blSEcj" style="display: block;"></span></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        </td>
                                                        <td style="padding: 0px;line-height:14px;"><a href="tel:${telephoneClean || telephone}" style="text-decoration: none; color: #ffffff;line-height:16px; font-size: 11px;font-family: 'Open Sans', Arial, sans-serif;"><span style="text-decoration: none;line-height:16px; font-family: 'Open Sans', Arial, sans-serif;color: #030303; font-size: 11px;font-weight: normal;">${escapeXml(telephone)}</span></a></td>
                                                    </tr>` : ''}
                                                    ${email ? `<tr height="20" style="vertical-align: middle;">
                                                        <td width="21" style="vertical-align: middle;">
                                                        <table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family:  'Open Sans', Arial, sans-serif;line-height:14px;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="vertical-align: bottom;"><span width="12" class="sc-jlyJG bbyJzT" style="display: block;"><img src="https://iili.io/frcie3l.png" color="#3a975b" width="13" height="9" class="sc-iRbamj blSEcj" style="display: block;"></span></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        </td>
                                                        <td style="padding: 0px;line-height:14px;"><a href="mailto:${email}" style="text-decoration: none;line-height:16px; color: #ffffff; font-size: 11px;line-height: 16px;font-family: 'Open Sans', Arial, sans-serif;"><span style="text-decoration: none;line-height:16px; font-family: 'Open Sans', Arial, sans-serif;line-height: 16px;color: #030303; font-size: 11px;font-weight: normal;">${escapeXml(email)}</span></a></td>
                                                    </tr>` : ''}
                                                    ${address ? `<tr height="20" style="vertical-align: middle;">
                                                        <td width="21" style="vertical-align: middle;">
                                                        <table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family:  'Open Sans', Arial, sans-serif;line-height:14px;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="vertical-align: bottom;"><span width="12" class="sc-jlyJG bbyJzT" style="display: block;"><img src="https://iili.io/frcika2.png" color="#3a975b" width="13" height="15" class="sc-iRbamj blSEcj" style="display: block;"></span></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        </td>
                                                        <td style="padding: 0px;line-height:14px;"><a href="${addressUrl || '#'}" style="text-decoration: none;line-height:16px; color: #ffffff; font-size: 11px;line-height: 16px;font-family: 'Open Sans', Arial, sans-serif;"><span style="text-decoration: none;line-height:16px; font-family: 'Open Sans', Arial, sans-serif;line-height: 16px;color: #030303; font-size: 11px;font-weight: normal;">${escapeXml(address)}</span></a></td>
                                                    </tr>` : ''}
                                                    ${website ? `<tr height="20" style="vertical-align: middle;">
                                                        <td width="21" style="vertical-align: middle;">
                                                        <table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family:  'Open Sans', Arial, sans-serif;line-height:14px;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="vertical-align: bottom;"><span width="12" class="sc-jlyJG bbyJzT" style="display: block;"><img src="https://iili.io/frci8y7.png" color="#3a975b" width="14" height="14" class="sc-iRbamj blSEcj" style="display: block;"></span></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        </td>
                                                        <td style="padding: 0px;line-height:14px;"><a href="${websiteUrl || '#'}" style="text-decoration: none;line-height:16px; color: #ffffff; font-size: 11px;line-height: 16px;font-family: 'Open Sans', Arial, sans-serif;"><span style="text-decoration: none;line-height:16px; font-family: 'Open Sans', Arial, sans-serif;line-height: 16px;color: #030303; font-size: 11px;font-weight: normal;">${escapeXml(website)}</span></a></td>
                                                    </tr>` : ''}
                                                    ${linkedin ? `<tr height="20" style="vertical-align: middle;">
                                                        <td width="21" style="vertical-align: middle;">
                                                        <table cellpadding="0" cellspacing="0" class="sc-gPEVay eQYmiW" style="vertical-align: -webkit-baseline-middle; font-size: medium; font-family:  'Open Sans', Arial, sans-serif;line-height:14px;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="vertical-align: bottom;"><span width="12" class="sc-jlyJG bbyJzT" style="display: block;"><img src="https://iili.io/frcigje.png" color="#3a975b" width="14" height="14" class="sc-iRbamj blSEcj" style="display: block;"></span></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        </td>
                                                        <td style="padding: 0px;line-height:14px;"><a href="${linkedinUrl || '#'}" style="text-decoration: none;line-height:16px; color: #ffffff; font-size: 11px;line-height: 16px;font-family: 'Open Sans', Arial, sans-serif;"><span style="text-decoration: none;line-height:16px; font-family: 'Open Sans', Arial, sans-serif;line-height: 16px;color: #030303; font-size: 11px;font-weight: normal;">${escapeXml(linkedin)}</span></a></td>
                                                    </tr>` : ''}
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="line-height:0px;padding-top:10px;">
                    <!-- Static Solid Gold Framing Line Bar -->
                    <img width="560" height="8" alt="DEC Gold Bar" border="0" style="display:block;width:560px;height:8px;background-color:#bd902e;border:none;" src="${LINEBAR_PNG_BASE64}">
                </td>
            </tr>
            <tr>
                <td style="padding-top:7px;line-height: 11px;font-size:8px;font-family: 'Open Sans', Arial, sans-serif;text-align: justify;">
                    <span style="font-family: 'Open Sans', Arial, sans-serif; line-height: 11px; font-size:8px;text-align: justify;font-weight:normal;color: #030303;">
                        ${escapeXml(disclaimer)}
                    </span>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>`;
};

function escapeXml(unsafe = '') {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default generateSignatureHtml;
