// gdb from js by @sha0coder

var http = {};
http.async = function(url,data,cb) {
        var obj = new XMLHttpRequest();
        http.isPost = (data != '');

        obj.onreadystatechange = function() {
                if (obj.readyState == 4) {
                        cb({    url: url,
                                post: (http.isPost?data:''),
                                stat: obj.readyState,
                                code: obj.status,
                                data: obj.responseText,
                        });
                }
        }

        obj.onerror = function () {
                cb({    url: url,
                        stat:-1,
                        code: 404,
                        data:''
                });
        }

        obj.open((http.isPost?'POST':'GET'), url, true);
        if (http.isPost)
                obj.send(data);
        else
                obj.send();
}
