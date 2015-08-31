package com.map;

import java.util.Collections;
import java.util.Hashtable;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;



import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Text;


import net.sf.jsr107cache.Cache;
import net.sf.jsr107cache.CacheException;
import net.sf.jsr107cache.CacheManager;


/**
 * Created With Eclipse
 * User : Dawei Jia
 * Date : 11/22/2013
 * @author jiadw_000
 *
 */
public class DataBase {

    private Cache cache;
    private String dbName;
    private static final Logger logger = Logger.getLogger(DataBase.class.getCanonicalName());

    /**
     * Constructor method
     * @param dbName table name
     */
    public DataBase(String dbName){

        this.dbName = dbName;


    }
    /**
     * replace colValue in specific colName
     * @param userID
     * @param colName
     * @param colValue
     * @throws ServletException
     */
    public void replace(String userID, String colName, String colValue) throws ServletException{


        logger.log(Level.INFO, "Putting user " + userID
                + "'s setting information to Datastore");
        DatastoreService datastore = DatastoreServiceFactory
                .getDatastoreService();
        Key clientKey = KeyFactory.createKey(dbName, userID);
        Entity entity = new Entity(clientKey);
        Text textValue = new Text(colValue);
        entity.setProperty(colName, textValue);
        Key key = datastore.put(entity);
        logger.log(Level.INFO, "Putting user " + userID
                + "'s setting information to Cache key"+ key);
        cache = createCache();
        cache.put(KeyFactory.keyToString(clientKey), entity);


    }

    /**
     * fetch colvalue according colName and key
     * @param key
     * @param colName
     * @return column value
     * @throws ServletException
     */
    public String fetch(String key, String colName) throws ServletException {
        logger.log(Level.INFO, "Retrieving user " + key
                + "'s setting information from Cache");
        cache = createCache();
        Key clientKey = KeyFactory.createKey(this.dbName, key);
        Entity entity = (Entity) cache.get(KeyFactory.keyToString(clientKey));
        String info = "";
        if (entity == null) {
            try {
                logger.log(Level.INFO,
                        "Can not find in Cache, so retrieving user " + key
                                + "'s setting information from Datastore");
                DatastoreService datastore = DatastoreServiceFactory
                        .getDatastoreService();
                Entity result = datastore.get(clientKey);

                Text text = (Text)result.getProperty(colName);
                info = text.getValue();
            } catch (Exception e) {
                info = null;
                logger.log(Level.WARNING, e.getMessage());
            }

        }else{
            Text text = (Text)entity.getProperty(colName);
            info = text.getValue();
        }

        return info;
    }
    /**
     * Create Cache for database
     * @return Cache (Map)
     * @throws ServletException
     */
    private Cache createCache() throws ServletException{
        // TODO Auto-generated method stub
        Map<String,Object> props = Collections.emptyMap();
        try{

            return CacheManager.getInstance().getCacheFactory().createCache(props);
        }catch(CacheException ex){
            logger.log(Level.WARNING, ex.getMessage());
            throw new ServletException("Could no initialize cahce:", ex);

        }
    }
    /**
     * delete one specific cache according to key
     * @param key
     * @throws CacheException
     */
    public void cleanUpCacheDB(String key) throws CacheException{

        Map<String, Object> props = Collections.emptyMap();
        cache = CacheManager.getInstance().getCacheFactory().createCache(props);
        Key clientKey = KeyFactory.createKey(dbName, key);
        Entity entity =(Entity) cache.get(KeyFactory.keyToString(clientKey));
        if(entity != null){

            //Data data = (Data)entity.getProperty("settings");
            logger.info("Removing cache of "+key);
            cache.remove(KeyFactory.keyToString(clientKey));


        }
        entity = (Entity) cache.get(KeyFactory.keyToString(clientKey));
        if(entity != null){

            logger.info("Cache of "+ key +" can not be removed");

        }else{

            logger.info("Cache of "+ key +"is removed");
        }
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        datastore.delete(clientKey);
        logger.info("data of "+ key +" is removed");

    }

    /**
     * process Array to String
     * @param str
     * @return String
     */
    public String processArray2String(String[] str){

        StringBuilder sb = new StringBuilder();
        for(String string : str){

            sb.append(string+",");

        }
        sb.deleteCharAt(sb.length()-1);
        return sb.toString();

    }
}