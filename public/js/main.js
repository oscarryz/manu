// This is all temporarily and may no even run in all browsers.
function saveDoc() {
    const editor = document.querySelector('#editor > div > div.ProseMirror.ProseMirror-example-setup-style')

    const html = editor.innerHTML;
    const title = editor.innerText.split('\n', 1)[0];
    var params = `title=${title}&content=${encodeURIComponent(html)}`;

    const doc = document.querySelector('body > div.grid-container > main');
    if (doc.dataset.id === 'undefined') {
        request('POST', '/api', params);
    } else {
        params += `&id=${doc.dataset.id}`        
        request('PUT', '/api', params);
    }
}

function request(method, url, params) {
    var http = new XMLHttpRequest();
    http.open(method, url, true);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function () {//Call a function when the state changes.
        if (http.readyState == 4 && http.status == 200) {
            document.location.href = http.responseURL;
        }
    }
    http.send(params);
}

function loadDoc() {
    const doc = document.querySelector('body > div.grid-container > main');
    request('GET', '/edit/' + doc.dataset.id);
}

