// create connection to salesforce
var C = require('./config.js');

exports.fetchActivities=function(org,recordLimit,oauth,callback,options)
{
	//var q="SELECT Id, Data_Type__c, SystemModstamp, Profile_Pic__c, Country__c, Longitude__c, Latitude__c, Content__c FROM CDF_Activity__c WHERE SystemModstamp>LAST_WEEK ORDER BY SystemModstamp ASC LIMIT "+recordLimit;
	var q="SELECT Id, SystemModstamp, "
										+C.SFNS+"Content__c, "
										+C.SFNS+"Profile_Pic__c, "
										+C.SFNS+"Data_Type__c, "
										+C.SFNS+"Country__c, "
										+C.SFNS+"Longitude__c, "
										+C.SFNS+"Latitude__c FROM "
										+C.SFNS+"CDF_Activity__c "
		+"WHERE SystemModstamp>LAST_WEEK AND Content__c!='' ";
		
		
		if(options && options.filter){
			if(options.filter.location){
				q += ' and '+C.SFNS+'Country__c = \''+options.filter.location.replace("'","\\'")+'\' ';
			}
			if(options.filter.community){
				q += ' and '+C.SFNS+'Challenge__r.'+C.SFNS+'Community__r.'+C.SFNS+'Community_Id__c = \''
						+options.filter.community.replace("'","\\'")+'\' ';
			}
			if(options.filter.challenge){
				q += ' and '+C.SFNS+'Challenge__r.'+C.SFNS+'Challenge_Id__c =  \''
						+options.filter.challenge.replace("'","\\'")+'\' ';
			}
			if(options.filter.eventType){
				q += ' and '+C.SFNS+'Data_Type__c =  \''+options.filter.eventType.replace("'","\\'")+'\' ';
			}
		}
		
		q+=' ORDER BY SystemModstamp DESC LIMIT '+recordLimit;
		console.log(q);
	var aEvents=new Array();
	console.log('[SFDC]: Grabbing previous '+recordLimit+' events');

	org.query(q, oauth, function(err, resp)
	{
	  if(!err && resp.records) 
	  {
	  	console.log('[SFDC]: loading previous '+resp.records.length+' events');

	  	for(i in resp.records)
	  	{
	  		var r=resp.records[i];
	  		aEvents.push({ 
	  			event: { type: 'createdDate', createdDate: r.SystemModstamp },
  				sobject: { 
					Content__c: r[C.SFNS+'Content__c'],
					Data_Type__c: r[C.SFNS+'Data_Type__c'],
					Latitude__c: r[C.SFNS+'Latitude__c'],
					Longitude__c: r[C.SFNS+'Longitude__c'],
					SystemModstamp: r.SystemModstamp,
					Country__c: r[C.SFNS+'Country__c'],
					Profile_Pic__c: r[C.SFNS+'Profile_Pic__c'],
					Id: r.Id
				} 
			  });
	  	}  
	  } 

	  console.log('[SFDC]: sending events to callback');
	  callback(aEvents);
	});
};