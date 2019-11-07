// This is all temporarily and may no even run in all browsers.
function saveDoc() {
    const editor = document.querySelector('#editor > div > div.ProseMirror.ProseMirror-example-setup-style')

    const html = editor.innerHTML;
    const title = editor.innerText.split('\n', 1)[0];
    console.log(title);
    var http = new XMLHttpRequest();
    var url = '/api';
    var params = `title=${title}&content=${encodeURIComponent(html)}`;
    http.open('POST', url, true);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.onreadystatechange = function() {//Call a function when the state changes.
        if (http.readyState == 4 && http.status == 200) {
            // alert(http.responseText);
            document.open();
            document.write(http.responseText);
            document.close()
        }
    }
    http.send(params);
}
  function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
  }