// create connection to salesforce


exports.fetchActivities=function(org,oauth,callback)
{
	var q="SELECT Id, Data_Type__c, SystemModstamp, Profile_Pic__c, Country__c, Longitude__c, Latitude__c, Content__c FROM CDF_Activity__c WHERE SystemModstamp>LAST_WEEK ORDER BY SystemModstamp DESC LIMIT 100";
	var aEvents=new Array();

	org.query(q, oauth, function(err, resp)
	{
	  if(!err && resp.records) 
	  {
	  	
	  	for(i in resp.records)
	  	{
	  		var r=resp.records[i];
	  		aEvents.push({ 
	  			event: { type: 'createdDate', createdDate: r.SystemModstamp },
  				sobject: { 
					Content__c: r.Content__c,
					Data_Type__c: r.Data_Type__c,
					Latitude__c: r.Latitude__c,
					Longitude__c: r.Longitude__c,
					SystemModstamp: r.SystemModstamp,
					Country__c: r.Country__c,
					Profile_Pic__c: r.Profile_Pic__c,
					Id: r.Id
				} 
			  });
	  	}  
	  } 

	  callback(aEvents);
	});
};