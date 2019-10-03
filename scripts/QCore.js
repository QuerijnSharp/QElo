if (typeof injected !== 'undefined' && injected) {
    console.error('Already Injected!');
}
else {
    var active = false;
    var allEvents = [];

    var element = document.body;
    var maindiv = document.createElement('div');
    var headerdiv = document.createElement('div');
    var secretDictionary = document.createElement('table');

    var longestDictionaryArray = [];
    var injected = true;

    var dictionaryScript;
    var helperFunctionScript;
    initiate();


    async function addScript(src) {
        return new Promise(function (resolve) {
            var newScript = document.createElement('script');
            newScript.onload = function () {
                resolve(newScript);
            };
            newScript.src = src;
            document.body.appendChild(newScript);
        });
    }

    //#region textToAddFunctions
    async function initiate() {

        //Load scripts
        dictionaryScript = await addScript("https://querijnsharp.github.io/QElo/scripts/Dictionary.js");
        console.log("Loaded Dictionary");
        helperFunctionScript = await addScript("https://querijnsharp.github.io/QElo/scripts/HelperFunctions.js");
        console.log("Loaded Helper funcitons");

        //Find all events
        Object.keys(window).forEach(key => {
            if (/^on/.test(key)) {
                allEvents.push(key.slice(2));
            }
        });
        for (var key in document) {
            if (key.substring(0, 2) == 'on' && !allEvents.includes(key.slice(2)))
                allEvents.push(key.slice(2));
        }
        for (var key in window) {
            if (key.substring(0, 2) == 'on' && !allEvents.includes(key.slice(2)))
                allEvents.push(key.slice(2));
        }

        //Add the keybypass :P
        bypassKeyBlock(document);

        //Create the hidden table
        tableCreate();

        //Create the *amazing* movable table
        headerdiv.style.padding = '8px';
        headerdiv.style.cursor = 'move';
        headerdiv.style.zindex = '10';
        headerdiv.style.background = '#2196F3';
        headerdiv.style.color = '#fff';
        headerdiv.textContent = 'Click here to move';
        headerdiv.draggable = true;

        maindiv.style.position = 'fixed';
        maindiv.style.left = '25%';
        maindiv.style.top = '25%';
        maindiv.style.zindex = '9';
        maindiv.style.background = '#f1f1f1';
        maindiv.style.textalign = 'center';
        maindiv.style.border = '1px solid #d3d3d3';
        maindiv.style.width = headerdiv.style.width;
        maindiv.style.height = 'auto';
        maindiv.style.resize = 'both';
        maindiv.style.overflow = 'auto';
        maindiv.style.display = 'flex';
        maindiv.style.flexDirection = 'column';

        maindiv.appendChild(headerdiv);
        maindiv.appendChild(secretDictionary);

        //Make it draggable (Thanks to the helper functions)
        dragElement(maindiv, headerdiv);

        var divs = document.getElementsByTagName('div');
        for (var div of divs) {
            if (/^q\d+$/gm.test(div.id)) {

                var questionAndAnswers = [];
                var question = ``;
                var questionText = "";

                for (var span of div.getElementsByTagName("span"))
                    if (span.className == "")
                        questionText = span.innerText;

                for (var em of div.getElementsByTagName("em"))
                    if (em.className == "")
                        questionText = em.innerText;

                for (var qtext of div.getElementsByClassName("qtext"))
                    questionText = qtext.innerText;

                var bestMatchCompare = 0;
                var found = false;
                for (var definition of dictionary) {
                    if (found) break;
                    for (var word of definition) {
                        if (word.toLowerCase().includes(questionText.toLowerCase()) || questionText.toLowerCase().includes(word.toLowerCase())) {
                            question = word;
                            questionAndAnswers = definition;
                            found = true;
                            break;
                        }
                        else {
                            var currentMatchPercent = QCompare(questionText.toLowerCase(), word.toLowerCase());
                            if (currentMatchPercent > bestMatchCompare) {
                                bestMatchCompare = currentMatchPercent;
                                questionAndAnswers = definition;
                                question = word;
                            }
                        }
                    }
                }

                if (questionAndAnswers == []) break;

                var answerIndex = 0;
                var answers = questionAndAnswers.filter(s => s != question);
                var inputs = document.getElementById(div.id).getElementsByTagName("input");
                var inputAmount = Array.from(inputs).filter(s => s.id.includes("answer")).length;

                //if (inputAmount == answers.length)
                for (var questionInput of inputs) {
                    if (questionInput.id.includes("answer")) {
                        if (answerIndex >= answers.length)
                            break;
                        questionInput.value = answers[answerIndex];
                        answerIndex++;
                    }
                }
            }
        }

        console.log('Injected succesfully');
        if (typeof script !== 'undefined')
            document.body.removeChild(script);
    }

    //Secret table shh
    function tableCreate() {
        secretDictionary.style.border = '1px solid black';

        for (var current of dictionary) {
            var tr = secretDictionary.insertRow();
            for (var j = 0; j < current.length; j++) {
                var td = tr.insertCell();
                td.appendChild(document.createTextNode(current[j]));
                td.style.border = '1px solid black';
            }
        }
        // Make it less visible
        secretDictionary.style.overflowY = 'scroll';
        secretDictionary.style.height = '100px';
        secretDictionary.style.display = 'block';
    }

    //Key stuff
    //#region keys
    function highLightEvent() {
        var selected = window.getSelection().toString();
        var item;
        for (var current of dictionary) {
            if (current.some(s => s.toLowerCase().includes(selected.toLowerCase()))) {
                for (var i = 0; i < current.length; i++) {
                    var currentWord = current[i];
                    if (!currentWord.toLowerCase().includes(selected.toLowerCase())) {
                        if (current.index == null) {
                            current.index = 0;
                        }
                        else if (current.index >= current.length) {
                            current.index = 0;
                        }
                        item = current[current.index];
                        current.index += 1;
                        break;
                    }
                    else {
                        current.index = i + 1
                        if (current.index >= current.length) {
                            current.index = 0;
                        }
                    }
                }
            }
        }

        if (item && selected != '') {
            var cacheItem = Object.assign(item);
            navigator.clipboard.writeText(cacheItem).then(function () {

            }, function (err) {

            });
        }
        event.returnValue = true;
        event.stopPropagation && event.stopPropagation();
    }

    function registerKeyEvent(e) {
        if (e.which == 220 || e.which == 221 || e.which == 186 || e.which == 192 || e.which == 219) {
            reverse();
        }
        else if (e.shiftKey && e.which == 53) {
            uninject();
        }
        else if (e.which != 13) {
            event.returnValue = true;
            event.stopPropagation && event.stopPropagation();
        }
    }

    function hide() {
        if (injected) {
            element.removeChild(maindiv);
        }
    }

    function show() {
        if (injected) {
            element.appendChild(maindiv);
        }
    }

    function reverse() {
        active = !active;
        if (active)
            show();
        else
            hide();
    }

    function uninject() {
        if (injected == false) {
            console.error('Already Uninjected!');
            throw new Error('Already Uninjected!');
        }
        else {
            if (active) {
                hide();
                active = false;
            }
            restoreKeyBlock(document);
            document.body.removeChild(dictionaryScript);
            document.body.removeChild(helperFunctionScript);

            injected = false;
            console.log('Uninjected succesfully');
        }
    }
    //#endregion

    //#region clickBypass
    function bypassKeyBlock(el) {
        el || (el = document);
        for (var event of allEvents) {
            switch (event) {
                case 'keydown':
                    el.addEventListener(event, registerKeyEvent, true);
                    break;
                case 'mouseup':
                    el.addEventListener(event, highLightEvent, true);
                    break;
            }
            if (event != 'dragstart' && event != "dragover" && event != "drop")
                el.addEventListener(event, blockKey, true);
        }
    }

    function restoreKeyBlock(el) {
        el || (el = document);
        for (var event of allEvents) {
            switch (event) {
                case 'keydown':
                    el.removeEventListener(event, registerKeyEvent, true);
                case 'mouseup':
                    el.removeEventListener(event, highLightEvent, true);
                    break;
            }
            el.removeEventListener(event, blockKey, true);
        }
    }

    function blockKey(event) {
        event.returnValue = true;
        event.stopPropagation && event.stopPropagation();
    }
    //#endregion
}