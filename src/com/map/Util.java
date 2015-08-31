package com.map;
import javax.servlet.ServletException;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.TimeZone;
/**
 * Created with MyEclipse
 * Date : 7/9/2015
 * User : Qian Li
 */
public class Util{
	
	private static String mailServerURL = "http://fawn.ifas.ufl.edu/mail/send.php";
	public static TimeZone timeZoneUsed = TimeZone.getTimeZone("America/New_York");
	public static int EMAIL_INTRO = 0;
	public static int EMAIL_WEEKLY_REPORT = 1;
	public static HashMap<String,String> SYSTEM = new HashMap<String,String>();
	public static HashMap<String,Code> email_code = new HashMap<String,Code>();
    static class Code {
         public String code;
		 public int trytimes;
		 public Long beginTime;
    };
	/**
	 * create security token for email server
	 * @param timestamp
	 * @param type
	 * @return token
	 * @throws NoSuchAlgorithmException
	 * @throws UnsupportedEncodingException
	 * @throws ServletException
	 */
	public static String createToken(String timestamp, String type) throws NoSuchAlgorithmException, UnsupportedEncodingException, ServletException {

		DataBase db = new DataBase("Aa12345678");
//		String secret = db.fetch("secret", "secret");
		String secret = "Aa12345678";
		String originalToken = "{" + secret + "}-{" + timestamp + "}-{" + type + "}";
		MessageDigest digest = java.security.MessageDigest.getInstance("MD5");
		digest.update(originalToken.getBytes("UTF8"));
		byte[] hash = digest.digest();
		StringBuffer hexString = new StringBuffer();
		for(int i = 0; i < hash.length; i++){
			
			String hex = Integer.toHexString(0xFF & hash[i]);
			if(hex.length() ==1){	
				hexString.append('0');
			}
			hexString.append(hex);
			
		}
		return hexString.toString();

	}
	
	/**
	 * Invoke function for weekly report 
	 * @param results
	 * @param email
	 * @return reponse from mail server
	 * @throws Exception
	 */
	public static String requestCode(String email) throws Exception{
		
		String urlParameters = buildLoginCode(email);
		return  postRequest2ExternalServer(mailServerURL, urlParameters);
		
	}
	/**
	 * build weekly report parameters
	 * @param results
	 * @param email
	 * @return url parameters
	 * @throws Exception
	 */
	public static String buildLoginCode(String email) throws Exception{
		
		
		//parameters not used : ranking links techonology 
		StringBuilder urlParameters = new StringBuilder();
		String timestamp = Long.toString(System.nanoTime());
		String app = "GetCode";
		String email_token = createToken(timestamp, app);
		String unsubscribe_token = createToken(timestamp, email);
		int randomPIN = (int)(Math.random()*9000)+1000;
		//String code = String.valueOf(randomPIN);
		//get common result attributes
		Code code = new Code();
		code.code = String.valueOf(randomPIN);
		code.beginTime = System.currentTimeMillis();
		code.trytimes = 0;
		email_code.put(email, code);
		urlParameters.append("&to=" + email +"&subject=Code for Login" +"&code=" + code.code
				+ "&template_name=" + app + "&email_token=" + email_token + "&unsubscribe_token=" + unsubscribe_token + "&timestamp=" + timestamp
				+ "&app=" + app );
		return urlParameters.toString();
		
	}
	public static Boolean isValid(String email, String code) throws Exception{

		if (email_code.containsKey(email)) {
			Code c = email_code.get(email);
			Long curtime = System.currentTimeMillis();
			c.trytimes++;
			System.out.println(c.trytimes);
			if (c.trytimes > 3 || (curtime - c.beginTime) / 1000 > 60) {
				email_code.remove(email);
                return false;
			}
			if (c.code.equals(code)) {
				email_code.remove(email);
				return true;
			}
			else {
				return false;
			}
		}
		else {
			System.out.println("Does not contain this email");
			return false;
		}
	}
	/**
	 * post request to mail server to get weekly report
	 * @param serverURL
	 * @param postParas
	 * @return reponse information from mail server
	 * @throws IOException
	 */
	public static String postRequest2ExternalServer(String serverURL,
			String postParas) throws IOException {
		
		HttpURLConnection connection = Util.createUrlConnection(serverURL, "application/x-www-form-urlencoded", postParas, "POST");
		DataOutputStream wr = new DataOutputStream(connection.getOutputStream());
		wr.writeBytes(postParas);
		wr.flush();
		wr.close();
		BufferedReader in = new BufferedReader(new InputStreamReader(
				connection.getInputStream()));

		StringBuilder response = new StringBuilder();
		while (in.ready()) {

			response.append(in.readLine()+"\n");
		}
		in.close();
		connection.disconnect();
		if (response.length() == 0) {
			// fail
			return null;
		}
		return response.toString();
	}
	/**
	 * create http url connection
	 * @param serverURL
	 * @param contentType
	 * @param postParas
	 * @param method
	 * @return
	 * @throws IOException
	 */
	public static HttpURLConnection createUrlConnection(String serverURL, String contentType, String postParas, String method) throws IOException{
		
		URL url = new URL(serverURL);
		HttpURLConnection connection = (HttpURLConnection) url.openConnection();
		connection.setDoOutput(true);
		connection.setDoInput(true);
		connection.setInstanceFollowRedirects(false);
		connection.setRequestMethod(method);
		connection.setRequestProperty("Content-Type",
				contentType);
		connection.setRequestProperty("charset", "utf-8");
		connection.setRequestProperty("Content-Length",
				"" + Integer.toString(postParas.getBytes().length));
		connection.setUseCaches(false);
		
		return connection;
			
	}
	
	/*public static void main(String arghhs[]) throws NoSuchAlgorithmException, UnsupportedEncodingException{
		
		Util util = new Util();
		String timestamp = Long.toString(System.nanoTime());
		System.out.println(util.createToken(timestamp, "email"));  
			
	}*/
	
}