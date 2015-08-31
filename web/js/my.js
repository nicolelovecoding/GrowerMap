$(document).ready(function(){
	
	$('.tips').tooltip();
	var email;
	var name;
	if($.cookie("email")!=null){
		
		email=$.cookie("email");
		name= $.cookie("name");
		$('#Gname').html("Grower: "+ name);
		//alert(email);
		var $welcome=$("<li><a>Hi,&nbsp;"+email+"</a></li>");
		var $sibling=$("#additionalbar li:first");
		$sibling.before($welcome);
		$("#additionalbar").css("display","block");
		var $login=$("a[href='login.jsp']");
		$login.css("display","none");
		$(".inactive").css("display","block");
	}
	else {
		var $show=$("a[href='showMap.html']");
		$show.css("display","none");
		$(".inactive").css("display","block");
		$("#logout").hide();
	}
	
	$("#logout").click(function(){

		//var id = $.cookie("staionId");
		//var label = $.cookie("staionLabel");
		//$.cookie("email",email,{ expires:-1 });
		$.removeCookie("email", {});
		$.removeCookie("name", {});
		$.removeCookie("grower", {});
		$.removeCookie("station", {});
		$.removeCookie("stationId", {});
		$.removeCookie("source", {});
		$.removeCookie("station_id", {});
		$.removeCookie("station_name", {});
		//$.cookie("name",name,{ expires:-1 });
		//$.cookie("staionId",id, { expires:-1 });
		//$.cookie("staionLabel",id, { expires:-1 });
		location.href="/index.html";
		
	});

});