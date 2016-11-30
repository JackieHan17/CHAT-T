$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDOyrmoJfvdOKSzWNffYLXN5Bct2UmvJac",
    authDomain: "chatt-a7bcb.firebaseapp.com",
    databaseURL: "https://chatt-a7bcb.firebaseio.com",
    storageBucket: "chatt-a7bcb.appspot.com",
    messagingSenderId: "716468796769"
  };
  firebase.initializeApp(config);

  // Firebase database reference
  var dbChatRoom = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');
  var dbRef = firebase.database().ref();

  var photoURL;
  var $img = $('img');
  var $messageField = $('#messageInput');
  var $messageList = $('#example-messages2');
  // REGISTER DOM ELEMENTS
  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');
  const $hovershadow = $('.hover-shadow');
  const $btnSubmit = $('#btnSubmit');
  const $signInfo = $('#sign-info');
  const $file = $('#file');
  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');
  const $profileAge = $('#profile-age');
  //input
  const $InputAge = $('#userAge')
  const $InputLocation = $('#userLocation')

  // Hovershadow
  $hovershadow.hover(
    function(){
      $(this).addClass("mdl-shadow--4dp");
    },
    function(){
      $(this).removeClass("mdl-shadow--4dp");
    }
  );

  var storageRef = firebase.storage().ref();

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };

    // Push to child path.
    // [START oncomplete]
    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
      // [END onfailure]
    });
    // [END oncomplete]
  }

  window.onload = function() {
    $file.change(handleFileSelect);
    // $file.disabled = false;
  }

  // SignIn/SignUp/SignOut Button status
  var user = firebase.auth().currentUser;
  if (user) {
    $btnSignIn.attr('disabled', 'disabled');
    $btnSignUp.attr('disabled', 'disabled');
    $btnSignOut.removeAttr('disabled')
  } else {
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
  }

  // Sign In
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(){
      window.location.href = "./second-page.html";
      console.log('SignIn User');
    });
  });

  // SignUp
  $btnSignUp.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signUp
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
      console.log("SignUp user is "+user.email);
      const dbUserid = dbUser.child(user.uid);
      dbUserid.push({email:user.email});
      window.location.href = "./second-page.html";
    });
  });

  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    if(user) {
      console.log(user);
      const loginName = user.displayName || user.email;
      const dbUserid = dbUser.child(user.uid);
      var $age = dbUserid.child('Age');
      var $loc = dbUserid.child('Loc');
      $signInfo.html(loginName+" is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignUp.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled')
      $profileName.html(user.displayName);
      $profileEmail.html(user.email);
      $img.attr("src",user.photoURL);
    } else {
      console.log("not logged in");
      $profileName.html("N/A");
      $profileEmail.html('N/A');
      $img.attr("src","");
    }

    $age.on('value', function(snap){
        $profileAge.html(snap.val());
      });
  });

  // SignOut
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    $signInfo.html('No one login...');
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled')
    $btnSignUp.removeAttr('disabled')
    window.location.href = "./index.html";
  });

  // Submit
  $btnSubmit.click(function(){
    var user = firebase.auth().currentUser;
    const $userName = $('#userName').val();
    //get input
    const dbUserid = dbUser.child(user.uid);
    var age = $InputAge.val();
    var loc= $InputLocation.val();

    dbUserid.set({Age:age,Loc:loc});
    var $age = dbUserid.child('Age');
    var $loc = dbUserid.child('Loc');
    // show on profile

      $age.on('value', function(snap){
        $profileAge.html(snap.val());
      });



    const promise = user.updateProfile({
      displayName: $userName,
      photoURL: photoURL
    });
    promise.then(function() {
      console.log("Update successful.");
      user = firebase.auth().currentUser;
      if (user) {
        $profileName.html(user.displayName);
        $profileEmail.html(user.email);
        $img.attr("src",user.photoURL);
        const loginName = user.displayName || user.email;
        $signInfo.html(loginName+" is login...");
      }
    });
  });

  //chatroom
  firebase.auth().onAuthStateChanged(function(user){
    if(user){
    var use = firebase.auth().currentUser;
    const dbUserid = dbUser.child(use.uid);
    var $loc = dbUserid.child('Loc');
    $loc.on('value', function(snap){
      var loc = snap.val();
      console.log(loc);
    });
$messageField.keypress(function (e) {
  if (e.keyCode == 13) {

    var use = firebase.auth().currentUser;
    const dbUserid = dbUser.child(use.uid);
    var loc = dbUserid.child('Loc');
    var locc;
    loc.on('value', function(snap){
      locc = snap.val();
    });
    //FIELD VALUES
    var username = use.displayName;
    var message = $messageField.val();
    var picture = use.photoURL;
    console.log(username);
    console.log(message);
    console.log(locc);


    //SAVE DATA TO FIREBASE AND EMPTY FIELD
    dbChatRoom.push({name:username, text:message, pic:picture,loc:locc});
    $messageField.val('');
  }
});

// Add a callback that is triggered for each chat message.
dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {

  var use = firebase.auth().currentUser;

  //GET DATA
  var data = snapshot.val();
  var username = data.name || "anonymous";
  var message = data.text || "";
  var pic = data.pic;
  var loc = data.loc;

  //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
  var $messageElement = $("<li>");
  var locElement = $("<li>",{class:'loc'});
  locElement.text('來自 '+loc+' 的 :');
  var $nameElement = $("<strong class='example-chat-username'></strong>");
  if(message != ""){
    $nameElement.text(username+' :').prepend($('<img>',{class:'IDimg',src:data.pic}));
    $messageElement.text(message).prepend($nameElement).prepend(locElement);



    //ADD MESSAGE
    $messageList.append($messageElement);
  }

  //SCROLL TO BOTTOM OF MESSAGE LIST
  $messageList[0].scrollTop = $messageList[0].scrollHeight;
});

}
});


});
