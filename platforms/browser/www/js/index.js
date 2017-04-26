/*****************************************************************
File: index.js
Author: Julien Tougas, Hayden Kyte
Description: Secret Messenger app
Version: 1.0.1
Updated: April 26, 2017
*****************************************************************/
"use strict"
var imageLocal = null
    , open = null
    , close = null
    , endURL = null
    , req = null
    , url = null
    , userId = null
    , userGuid = null
    , userName = null
    , userEmail = null
    , msgs = []
    , msg = {}
    , modalEvent = new CustomEvent('touchend', {
        bubbles: true
        , cancelable: true
    });
var app = {
    initialize: function () {
        document.addEventListener('deviceready', app.onDeviceReady);
    }
    , onDeviceReady: function () {
        document.querySelector("#loginBtn").addEventListener('touchend', app.login);
        document.querySelector("#registerBtn").addEventListener('touchend', app.register);
        document.querySelector("#refresh").addEventListener('touchend', app.display);
        document.querySelector("#delBtn").addEventListener('touchend', app.delete);
        document.querySelector("#sendBtn").addEventListener('touchend', app.send);
        document.querySelector("#closePic").addEventListener('touchend', function () {
            app.openCloseModal('#listModal', '#picModal');
        });
        document.querySelector("#closeDel").addEventListener('touchend', function () {
            app.openCloseModal('#listModal', '#delModal');
        });
        document.querySelector("#openPic").addEventListener('touchend', app.picture);
        document.querySelector("#sendMsg").addEventListener('touchend', app.picture);
        document.querySelector("#takePicBtn").addEventListener('touchend', app.takePic);
    }
    , openCloseModal: function (open, close) {
        console.log(open + "  " + close);
        if (open != null) {
            document.querySelector(open).classList.add('active');
        }
        if (close != null) {
            document.querySelector(close).classList.remove('active');
        }
    }
    , login: function (ev) {
        ev.preventDefault();
        document.activeElement.blur();
        userName = document.querySelector("#userForm").value;
        userEmail = document.querySelector("#emailForm").value;
        var fd = new FormData();
        fd.append('user_name', userName);
        fd.append('email', userEmail);
        url = "https://griffis.edumedia.ca/mad9022/steg/login.php";
        req = new Request(url, {
            method: 'POST'
            , mode: 'cors'
            , body: fd
        });
        fetch(req).then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log(data);
            if (data.code == 0) {
                userId = data.user_id;
                userGuid = data.user_guid;
                app.display();
            }
            else {
                alert("Invalid user information");
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
    , register: function (ev) {
        ev.preventDefault();
        document.activeElement.blur();
        userName = document.querySelector("#userForm").value;
        userEmail = document.querySelector("#emailForm").value;
        var fd = new FormData();
        fd.append('user_name', userName);
        fd.append('email', userEmail);
        url = "https://griffis.edumedia.ca/mad9022/steg/register.php";
        req = new Request(url, {
            method: 'POST'
            , mode: 'cors'
            , body: fd
        });
        fetch(req).then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log(data);
            if (data.code == 0) {
                userId = data.user_id;
                userGuid = data.user_guid;
                app.display();
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
    , display: function () {
        app.openCloseModal('#listModal', null);
        var fd = new FormData();
        fd.append('user_id', userId);
        fd.append('user_guid', userGuid);
        url = "https://griffis.edumedia.ca/mad9022/steg/msg-list.php";
        req = new Request(url, {
            method: 'POST'
            , mode: 'cors'
            , body: fd
        });
        fetch(req).then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log(data);
            if (data.code == 0) {
                if (data.messages.length != 0) {
                    var ul = document.querySelector('#msgList');
                    ul.innerHTML = "";
                    data.messages.forEach(function (message) {
                        var li = document.createElement("li")
                            , a = document.createElement("a")
                            , p = document.createElement("p");
                        li.classList.add("table-view-cell", "media");
                        li.setAttribute("data-num", message.msg_id);
                        a.classList.add("navigate-right");
                        a.addEventListener('touchend', app.showMsg);
                        p.innerHTML = "Message from: " + message.user_name;
                        li.appendChild(a);
                        a.appendChild(p);
                        ul.appendChild(li);
                        msg = {
                            msg_id: message.msg_id
                            , sender_id: message.sender_id
                            , user_name: message.user_name
                        }
                        msgs.push(msg);
                    });
                }
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
    , picture: function (ev) {
        app.openCloseModal('#picModal', '#delModal');
        app.openCloseModal('#picModal', '#listModal');
        document.querySelector("#select").style.display = "none";
        document.querySelector("#msgForm").style.display = "none";
        document.querySelector("#sendBtn").style.display = "none";
        var c = document.querySelector("#picCanvas");
        var ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        document.querySelector("#msgForm").innerHTML = "";
        var fd = new FormData();
        fd.append('user_id', userId);
        fd.append('user_guid', userGuid);
        url = "https://griffis.edumedia.ca/mad9022/steg/user-list.php";
        req = new Request(url, {
            method: 'POST'
            , mode: 'cors'
            , body: fd
        });
        fetch(req).then(function (response) {
            return response.json();
        }).then(function (data) {
            if (data.code == 0) {
                console.log(data);
                var select = document.querySelector("#select");
                select.innerHTML = "";
                var firstOpt = document.createElement("option");
                firstOpt.setAttribute('value', "")
                firstOpt.innerHTML = "Choose Receiver";
                select.appendChild(firstOpt);
                data.users.forEach(function (user) {
                    var opt = document.createElement("option");
                    opt.setAttribute('value', user.user_id);
                    opt.innerHTML = user.user_name;
                    select.appendChild(opt);
                });
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
    , takePic: function (ev) {
        ev.preventDefault();
        //
        navigator.camera.getPicture(app.successCallback, app.errorCallback, {
            quality: 50
            , destinationType: Camera.DestinationType.FILE_URI
            , allowEdit: true
            , targetWidth: 300
            , targetHeight: 300
        });
    }
    , successCallback: function (imageURI) {
        console.log("successCallback");
        imageLocal = imageURI;
        var c = document.querySelector("#picCanvas");
        var ctx = c.getContext('2d');
        var img1 = document.createElement('img');
        img1.setAttribute("src", imageLocal);
        //img1.setAttribute("height", "200px");
        //img1.setAttribute("width", "200px");
        img1.addEventListener('load', function (ev) {
            //image has been loaded
            var w = img1.width;
            var h = img1.height;
            c.style.width = w + 'px';
            c.style.height = h + 'px';
            c.width = w;
            c.height = h;
            ctx.drawImage(img1, 0, 0);
        });
        document.querySelector("#select").style.display = "block";
        document.querySelector("#msgForm").style.display = "block";
        document.querySelector("#sendBtn").style.display = "block";
    }
    , errorCallback: function (message) {
        alert('Failed because: ' + message);
    }
    , send: function (ev) {
        ev.preventDefault();
        document.activeElement.blur();
        var sendUserId = document.querySelector("#select").value;
        var userMsg = document.querySelector("#msgForm").value;
        app.openCloseModal('#listModal', '#picModal');
        var msgBitsArray = BITS.stringToBitArray(userMsg);
        //
        console.log(sendUserId);
        var idBitsArray = BITS.numberToBitArray(sendUserId);
        var lengthBitsArray = BITS.numberToBitArray((userMsg.length) * 16);
        console.log(userMsg.length);
        //
        var sendCanvas = document.querySelector("#picCanvas");
        var userCanvas = BITS.setUserId(idBitsArray, sendCanvas);
        var lengthCanvas = BITS.setMsgLength(lengthBitsArray, userCanvas);
        var finalCanvas = BITS.setMessage(msgBitsArray, lengthCanvas);
        console.log("Final Canvas " + finalCanvas);
        if (!HTMLCanvasElement.prototype.toBlob) {
            Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
                value: function (callback, type, quality) {
                    var binStr = atob(this.toDataURL(type, quality).split(',')[1])
                        , len = binStr.length
                        , arr = new Uint8Array(len);
                    for (var i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }
                    callback(new Blob([arr], {
                        type: type || 'image/png'
                    }));
                }
            });
        }
        finalCanvas.toBlob(function (blob) {
            var fd = new FormData();
            fd.append('user_id', userId);
            fd.append('user_guid', userGuid);
            fd.append('recipient_id', sendUserId);
            fd.append('image', blob);
            url = "https://griffis.edumedia.ca/mad9022/steg/msg-send.php";
            req = new Request(url, {
                method: 'POST'
                , mode: 'cors'
                , body: fd
            });
            console.log(fd);
            console.log(req);
            fetch(req).then(function (response) {
                console.dir(response);
                return response.json();
            }).then(function (data) {
                console.dir(data);
                if (data.code == 0) {
                    console.log(data);
                    app.display();
                };
            }).catch(function (err) {
                console.log(err);
            });
        }, 'image/png');
    }
    , showMsg: function (ev) {
        ev.preventDefault();
        app.openCloseModal('#delModal', '#listModal');
        var msgId = ev.currentTarget.parentElement.getAttribute("data-num");
        console.log(msgId);
        var fd = new FormData();
        fd.append('user_id', userId);
        fd.append('user_guid', userGuid);
        fd.append('message_id', msgId);
        url = "https://griffis.edumedia.ca/mad9022/steg/msg-get.php";
        req = new Request(url, {
            method: 'POST'
            , mode: 'cors'
            , body: fd
        });
        fetch(req).then(function (response) {
            return response.json();
        }).then(function (data) {
            if (data.code == 0) {
                console.log(data);
                msgs.forEach(function (msg, index) {
                    if (msg.msg_id == msgId) {
                        document.querySelector("#from").innerHTML = "From: " + msg.user_name;
                        document.querySelector("#decodedMsg").setAttribute("data-num", msg.msg_id);
                    }
                });
                var c = document.querySelector("#delCanvas");
                var ctx = c.getContext('2d');
                var img1 = document.createElement('img');
                img1.setAttribute("src", "https://griffis.edumedia.ca/mad9022/steg/" + data.image);
                img1.addEventListener('load', function (ev) {
                    //image has been loaded
                    var w = img1.width;
                    var h = img1.height;
                    c.style.width = w + 'px';
                    c.style.height = h + 'px';
                    c.width = w;
                    c.height = h;
                    ctx.drawImage(img1, 0, 0);
                    console.log(c);
                    var decodedMsg = BITS.getMessage(userId, c);
                    console.log("Decoded Message " + decodedMsg);
                    document.querySelector("#decodedMsg").innerHTML = "Message: " + decodedMsg;
                });
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
    , delete: function (ev) {
        ev.preventDefault();
        app.openCloseModal('#listModal', '#delModal');
        var msgId = document.querySelector("#decodedMsg").getAttribute("data-num");
        var fd = new FormData();
        fd.append('user_id', userId);
        fd.append('user_guid', userGuid);
        fd.append('message_id', msgId);
        url = "https://griffis.edumedia.ca/mad9022/steg/msg-delete.php";
        req = new Request(url, {
            method: 'POST'
            , mode: 'cors'
            , body: fd
        });
        fetch(req).then(function (response) {
            return response.json();
        }).then(function (data) {
            if (data.code == 0) {
                console.log(data);
                app.display();
            }
        }).catch(function (err) {
            console.log(err);
        });
    }
};
app.initialize();