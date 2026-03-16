// ==UserScript==
// @name         IGDB Steam Data Peeker (Platform Y/N)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Finds Release Dates and OS support (Y/N) from Steam
// @author       NinaM33p
// @license      MIT
// @supportURL   https://github.com/NinaM33p/IGDB-Steam-Release-Date-Preview/issues
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

            // 1. Get Release Dates
            const releaseDate = doc.querySelector('.release_date .date')?.innerText || "N/A";
            let eaDate = "N/A";
            const boldTags = Array.from(doc.querySelectorAll('b'));
            const eaLabel = boldTags.find(b => b.innerText.includes('Early Access Release Date'));
            if (eaLabel) {
                eaDate = eaLabel.nextSibling?.textContent.trim().replace(':', '') || "N/A";
            }

            // 2. Check Platforms (Y/N Logic)
            const hasWin = doc.querySelector('.platform_img.win') ? 'Y' : 'N';
            const hasMac = doc.querySelector('.platform_img.mac') ? 'Y' : 'N';
            const hasLinux = doc.querySelector('.platform_img.linux') ? 'Y' : 'N';

            infoBox.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <b style="color:#9147ff;">Steam Data</b>
                    <span id="closePeeker" style="cursor:pointer; color:#ff4747; font-weight:bold;">[X]</span>
                </div>

                <div style="margin-bottom:10px;">
                    <small style="color:#aaa;">1.0 RELEASE</small><br>
                    <span style="font-size:13px;">${releaseDate}</span>
                    <button class="copy-btn" data-copy="${releaseDate}" style="display:block; width:100%; margin-top:4px; cursor:pointer; background:#333; color:white; border:1px solid #555; border-radius:4px; font-size:11px;">Copy 1.0</button>
                </div>

                <div style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #333;">
                    <small style="color:#aaa;">EARLY ACCESS</small><br>
                    <span style="font-size:13px;">${eaDate}</span>
                    <button class="copy-btn" data-copy="${eaDate}" style="display:block; width:100%; margin-top:4px; cursor:pointer; background:#333; color:white; border:1px solid #555; border-radius:4px; font-size:11px;" ${eaDate === "N/A" ? 'disabled' : ''}>Copy EA</button>
                </div>

                <div style="line-height: 1.6;">
                    <b style="font-size:12px; color:#aaa; display:block; margin-bottom:4px;">PLATFORMS</b>
                    <div style="display:flex; justify-content:space-between; font-size:13px;">
                        <span>PC: <b style="color:${hasWin === 'Y' ? '#5cff9d' : '#ff4747'}">${hasWin}</b></span>
                        <span>Mac: <b style="color:${hasMac === 'Y' ? '#5cff9d' : '#ff4747'}">${hasMac}</b></span>
                        <span>Linux: <b style="color:${hasLinux === 'Y' ? '#5cff9d' : '#ff4747'}">${hasLinux}</b></span>
                    </div>
                </div>
            `;

            document.getElementById('closePeeker').onclick = () => infoBox.remove();
            infoBox.querySelectorAll('.copy-btn').forEach(btn => {
                btn.onclick = () => {
                    const textToCopy = btn.getAttribute('data-copy');
                    if (textToCopy !== "N/A") {
                        navigator.clipboard.writeText(textToCopy);
                        const originalText = btn.innerText;
                        btn.innerText = '✅ Copied!';
                        setTimeout(() => btn.innerText = originalText, 2000);
                    }
                };
            });
        }
    });
})();
