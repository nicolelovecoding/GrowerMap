<%--
  Created by IntelliJ IDEA.
  User: 茜
  Date: 2015/7/23
  Time: 17:04
  To change this template use File | Settings | File Templates.
--%>
<%@ page import="javax.servlet.http.Cookie" %>
<%
  Cookie[] cookies = request.getCookies();
  if (cookies == null) {
%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="">
  <meta name="author" content="">
  <link rel="shortcut icon" href="favicon.png">

  <title>My Virtual Lawn</title>

  <!-- Bootstrap core CSS -->
  <link href="css/bootstrap.css" rel="stylesheet">

  <!-- Custom styles for this template -->
  <link href="css/virtual-lawn.css" rel="stylesheet">

  <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
  <!--[if lt IE 9]>
  <script src="../..js/html5shiv.js"></script>
  <script src="../..js/respond.min.js"></script>
  <![endif]-->
</head>

<body>
<div class="navbar navbar-fixed-top navbar-inverse" role="navigation">
  <div class="container">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="#">My Florida Farm Weather!</a>
    </div>
    <div class="collapse navbar-collapse">
      <ul class="nav navbar-nav">
        <li class="active"><a href="/">Home</a></li>
        <li><a href="login.jsp">Login</a></li>
        <li><a href="contact.html">Contact</a></li>

      </ul>
    </div><!-- /.nav-collapse -->
  </div><!-- /.container -->
</div><!-- /.navbar -->

<div class="container">

  <div class="row row-offcanvas row-offcanvas-right">
    <div class="col-xs-12 col-sm-9">
      <p class="pull-right visible-xs">
        <button type="button" class="btn btn-primary btn-xs" data-toggle="offcanvas">Toggle nav</button>
      </p>

      <div class="row">
        <h1 class="add-margin">Please type your email address below and click "Send". Then you will receive an email with a code. Type the code and click "Login", then you will be able to view your data!</h1>
        <hr />
        <div class="alert alert-info add-margin" >
          <label>Email Address: </label>
          <input type="text" name="email" />
          &nbsp;&nbsp;&nbsp;
          <input type="submit" class="button" value="Send" />
          </br></br>
          <label>Code: </label>
          <input type="text" name="code" />
          &nbsp;&nbsp;&nbsp;
          <input type="submit" class="button" value="Login">
        </div>
      </div><!--/row-->
    </div><!--/span-->

    <div class="col-xs-6 col-sm-3 sidebar-offcanvas" id="sidebar" role="navigation">
      <div class="well sidebar-nav">
        <ul class="nav">
          <li>Navigation</li>
          <li><a href="index.html">Welcome</a></li>
          <li><a href="introduction.html">Introduction</a></li>
          <li class="active highlight"><a href="login.jsp">Login/Signup</a></li>

          <li class="inactive">Tool</li>
          <!--<li class="inactive"><a href="form-1.html">Step 1</a></li>
          <li class="inactive"><a href="form-2.html">Step 2</a></li>
          <li class="inactive"><a href="form-3.html">Step 3</a></li>
          <li><a href="rain-sensor-detail.html">Rain Sensor Detail</a></li>
          <li><a href="soil-moisture-settings.html">Soil Moisture Settings</a></li>
          <li><a href="irrigation-system.html">Irrigation System</a></li>
          <li><a href="correspondence.html">Correspondence</a></li>
           -->

        </ul>
      </div><!--/.well -->
    </div><!--/span-->
  </div><!--/row-->

  <hr>

</div><!--/.container-->
<!-- Bootstrap core JavaScript
================================================== -->
<!-- Placed at the end of the document so the pages load faster -->
<!-- Placed at the end of the document so the pages load faster -->
<!-- Placed at the end of the document so the pages load faster -->
<script src="js/jquery.js"></script>
<script src="js/bootstrap.js"></script>
<script src="js/lg.js"></script>
<script src="js/holder.js"></script>
<script src="js/jquery.cookie.js"></script>
<script src="js/application.js"></script>
</body>
</html>
<%    }
     else
        response.sendRedirect("showMap.html");
%>
