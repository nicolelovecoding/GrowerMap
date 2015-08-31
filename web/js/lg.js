$(document).ready(function(){

    var email;
    var name;
    $("input[value = 'Send']").click(function() {

        email = $("input[name = 'email' ]").val();
        if (email != "") $.post("/send",
            {"email": email},
            function (data) {
                name = data;
                console.log(name);
            }, "text");
    });
    $("input[value = 'Login']").click(function() {
        $.cookie("email",email,{ expires:7 });
        $.cookie("name",name,{ expires:7 });
        location.href="/showMap.html";
     /*   var code = $("input[name = 'code' ]").val();
        if (code != "") $.post("/login",
            {"code": code},
            function (data) {
                if (data == "1") {
                    $.cookie("email",email,{ expires:7 });
                    location.href="/showMap.html";
                }
            }, "text");   */
    });
});