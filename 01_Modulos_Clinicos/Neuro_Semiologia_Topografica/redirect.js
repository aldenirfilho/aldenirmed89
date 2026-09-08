"use strict";
// Resolve relative to this file's route; never accept an external destination.
const destination = new URL("../Semiologia_Neurologica_Topografica/aprofundamento.html", location.href);
destination.hash = location.hash;
document.getElementById("module-link").href = destination.href;
location.replace(destination.href);
