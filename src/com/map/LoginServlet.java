package com.map;

import java.io.IOException;
import java.net.URL;
import java.net.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
//import java.sql.*;
import com.google.appengine.repackaged.org.codehaus.jackson.map.ObjectMapper;
import com.map.Util;

/**
 * Created with MyEclipse
 * User : Qian Li
 * Date : 06/24/2015
 * @author Qian Li
 *
 */
@SuppressWarnings("serial")
public class LoginServlet extends HttpServlet{
/*	public static ResultSet executeQuery(String email) throws Exception {
		
		Connection con = null;
		
        Class.forName("com.mysql.jdbc.Driver");// 加载Mysql数据驱动    
        
        con = DriverManager.getConnection("jdbc:mysql://mysql.osg.ufl.edu/fdacsWxDB?user=fdacswx&password=UPXeTpPVIZ");// 创建数据连接
        
        String sql = "SELECT * FROM station where grower_email = ?;";
        PreparedStatement psql = con.prepareStatement(sql);
        psql.setString(1, email);
        
        return psql.executeQuery();
	}  */
	

	
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		String email = req.getParameter("email");
		String inputCode = req.getParameter("code");
	/*	ClassLoader cl = ClassLoader.getSystemClassLoader();
		 req
        URL[] urls = ((URLClassLoader)cl).getURLs();

        for(URL url: urls){
        	System.out.println(url.getFile());
        }    */

		try {
			//resp.getWriter().write(Util.buildWeeklyReportParameters("nicole.bupt@gmail.com"));
			Boolean founded = false;
			int i = 0;
			if (req.getServletPath().equals("/send")) {
				JsonFactory factory = new JsonFactory();
				URL url = new URL("http://fdacswx.fawn.ifas.ufl.edu/index.php/read/station/format/json");
				JsonParser jp = factory.createJsonParser(url);
				jp.nextToken();

				String name = "";
				while (jp.nextToken() == JsonToken.START_OBJECT) {
					while (jp.nextToken() != JsonToken.END_OBJECT) {
						String namefield = jp.getCurrentName();
						jp.nextToken();
						if ("grower_name".equals(namefield)) {
							name = jp.getText();
							//System.out.println(namefield + ":" + name);
						}
						if ("grower_email".equals(namefield)) {
							String e = jp.getText();
							if (e.equals(email)) {
								System.out.println(name + ", " + e);
								resp.getWriter().write(name);
								founded = true;
								break;
							}
						}
					}
					if (founded) break;
				}
				if (!founded) {

					resp.getWriter().write("Try again!"); System.out.println("The email is invalid!!!!");
				}
				else
				    System.out.println(Util.requestCode(email));    //change it to email
			}

			if (req.getServletPath().equals("/login") && founded) {
				System.out.println(inputCode);
				if (Util.isValid(email, inputCode))
					resp.getWriter().write("1");
			}

		} catch (Exception ex) {
			ex.printStackTrace();
		}

	}
}