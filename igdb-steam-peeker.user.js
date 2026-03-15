// ==UserScript==
// @name         IGDB Steam Data Peeker (Label Hunter)
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Finds the EA date by looking for the specific BOLD label
// @author       NinaM33p
// @match        https://www.igdb.com/games/*/edit*
// @match        https://www.igdb.com/games/*/changes*
// @grant        GM_xmlhttpRequest
// @connect      store.steampowered.com
// ==/UserScript==

(function() {
    'use strict';

    const steamInput = document.querySelector('input[value*="store.steampowered.com"]');
    if (!steamInput) return;

    const infoBox = document.createElement('div');
    infoBox.style.cssText = 'position:fixed; top:80px; right:20px; padding:15px; background:#1a1c23; color:#fff; border:2px solid #9147ff; border-radius:8px; z-index:9999; font-family:sans-serif; box-shadow: 0 4px 15px rgba(0,0,0,0.5); width: 220px;';
    infoBox.innerHTML = 'Scanning Steam...';
    document.body.appendChild(infoBox);

    GM_xmlhttpRequest({
        method: "GET",
        url: steamInput.value,
        onload: function(response) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(response.responseText, "text/html");

            // 1. Get Standard 1.0 Release Date
            const releaseDate = doc.querySelector('.release_date .date')?.innerText || "N/A";

            // 2. Get Early Access Date by hunting the <b> tag
            let eaDate = "N/A";
            const boldTags = Array.from(doc.querySelectorAll('b'));
            const eaLabel = boldTags.find(b => b.innerText.includes('Early Access Release Date'));

            if (eaLabel) {
                // Grab the text node immediately following the <b> tag
                eaDate = eaLabel.nextSibling?.textContent.trim().replace(':', '') || "N/A";
            }

            infoBox.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <b style="color:#9147ff;">Steam Data</b>
                    <span id="closePeeker" style="cursor:pointer; color:#ff4747; font-weight:bold;">[X]</span>
                </div>
                <div style="margin-bottom:10px;">
                    <small style="color:#aaa;">1.0 RELEASE</small><br>
                    <span style="font-size:13px;">${releaseDate}</span>
                    <button class="copy-btn" data-date="${releaseDate}" style="display:block; width:100%; margin-top:4px; cursor:pointer; background:#333; color:white; border:1px solid #555; border-radius:4px; font-size:11px;">Copy 1.0</button>
                </div>
                <div>
                    <small style="color:#aaa;">EARLY ACCESS</small><br>
                    <span style="font-size:13px;">${eaDate}</span>
                    <button class="copy-btn" data-date="${eaDate}" style="display:block; width:100%; margin-top:4px; cursor:pointer; background:#333; color:white; border:1px solid #555; border-radius:4px; font-size:11px;" ${eaDate === "N/A" ? 'disabled' : ''}>Copy EA</button>
                </div>
            `;

            document.getElementById('closePeeker').onclick = () => infoBox.remove();
            infoBox.querySelectorAll('.copy-btn').forEach(btn => {
                btn.onclick = () => {
                    navigator.clipboard.writeText(btn.getAttribute('data-date'));
                    btn.innerText = '✅ Copied!';
                    setTimeout(() => btn.innerText = btn.innerText.includes('1.0') ? 'Copy 1.0' : 'Copy EA', 2000);
                };
            });
        }
    });
})();
