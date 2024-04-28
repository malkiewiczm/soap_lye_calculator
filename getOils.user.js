// ==UserScript==
// @name        Soap Calc Get Oils
// @namespace   Violentmonkey Scripts
// @match       http://soapcalc.net/calc/soapcalcWP.asp
// @grant       none
// @version     1.0
// @author      -
// @description This is a userscript to get database of oils and their saponification values from soapcalc.net.
// ==/UserScript==

(function() {
  function getOils() {
    var oils = [];
    for (var i = 0; i < aryAllOils.length; ++i) {
      resetProps();
      getProperties(i, 1);
      var oil = aryAllOils[i];
      oils.push({
        id: oil.id,
        name: oil.name,
        koh_sap: oil.sap,
        naoh_sap: oil.sap * 0.712833719479594,
        iodine: oil.iodine,
        ins: oil.ins,
        lauric: oil.lauric,
        myristic: oil.myristic,
        palmitic: oil.palmitic,
        stearic: oil.stearic,
        ricinoleic: oil.ricinoleic,
        oleic: oil.oleic,
        linoleic: oil.linoleic,
        linolenic: oil.linolenic,
        hard: Hard,
        cleansing: Cleansing,
        bubbly: Bubbly,
        conditioning: Conditioning,
        creamy: Creamy,
        saturated: Saturated,
        mono_unsaturated: MonoUnsaturated,
        poly_unsaturated: PolyUnsaturated,
      });
    }
    return JSON.stringify(oils);
  }
  function addElement(parent, tag, text) {
    var element = document.createElement(tag);
    element.appendChild(document.createTextNode(text));
    parent.appendChild(element);
    return element;
  }
  var textarea = addElement(document.body, 'textarea', getOils());
  textarea.style.width = '100%';
  textarea.style.height = '500px';
  textarea.style.margin = '20px';
})();
