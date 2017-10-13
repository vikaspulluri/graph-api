/*  Declaration of global variables
	@variables - 
		- host_url = url of facebook graph api domain
		- access_token = default access token with limited permissions
*/
host_url = "https://graph.facebook.com";
//access_token = "EAACEdEose0cBAPm6CNaxEyBxGZBWa9582YKv2CE4soWwxCqkobZBi1e7ZCs0JkEiU6fAUeumSRIpzTWHbJtZBEIWplGL4Rc8v3PvoKMGMZCDy76xl8QssWmZB3ZBUoUbaPOW2pAjR0JNZCyRYxeht75hmmI1yv4gMw5mpAT74gTOZA2KVmWZBNA800JVdJXCgkz6vens1AHXdnHwZDZD";


/*	Function to perform operations after the DOM is fully prepared
*/
$(document).ready(function(){
	$('.fb-container').hide();
	$('.feed').on('click','div.feed-next',function(){
		url = $('.feed-next').attr('data').split('&');
		filters = '&';
		for(var i=1;i<url.length;i++){
			filters += url[i]; 
		}
		getUserFeed(filters);
	});
	$('#submit').on('click',function(){
		access_token = $('#access-token').val();
		/*  This section will execute only after isAccessTokenValid() is completed. 
			Since isAccessTokenValid() is using asynchronous call and JS parser will not wait until it gives back response, we are using $.when function
		*/
		$.when(isAccessTokenValid()).done(function(resp){
			if(resp.id){
				successOperations();
			}else{
				handleAppFailure(resp);
				return false;
			}
		});
	});
});

/*	Function to check if basic connectivity is there with graph api or not. 
	@params - 
	@HTTP method - GET
	@return -	Boolean(validToken ? true : false)
*/
var isAccessTokenValid = function(){
	var getRequest = $.ajax({
		url : buildHostUrl('me','id'),
		type : 'GET',
		beforeSend : function(){
			$('#loading-icon').attr('src','images/spinner.svg');
		}
	});
	getRequest.fail(function(getResult, getStatus, errorThrown){
		handleAppFailure(getResult);
	});
	getRequest.always(function(){
		$('#loading-icon').removeAttr('src');
	});
	return getRequest;
}

/*	Function that makes api call to get basic info about user
	@params - 
	@HTTP method - GET
	@return - Object that holds basic profile info (We are using Object constructor to construct object)
	(#see - https://stackoverflow.com/questions/6843951/which-way-is-best-for-creating-an-object-in-javascript-is-var-necessary-befor)
*/
function getUserBasicProfile(){
	var getRequest = $.ajax({
		url : buildHostUrl('me','name,birthday,likes.limit(7),email,about,first_name,gender,hometown,favorite_teams,favorite_athletes'),
		type : 'GET'
	});
	getRequest.done(function(response){
		var basicInfo = new Object();
		basicInfo.first_name = response.hasOwnProperty('first_name') ? response.first_name : null;
		basicInfo.name = response.hasOwnProperty('name') ? response.name : null;
		basicInfo.email = response.hasOwnProperty('email') ? response.email : null;
		basicInfo.gender = response.hasOwnProperty('gender') ? response.gender : null;
		basicInfo.hometown = handleObject(response.hometown);
		basicInfo.birthday = response.hasOwnProperty('birthday') ? response.birthday : null;
		basicInfo.favorite_athletes = handleObject(response.favorite_athletes);
		basicInfo.likes = handleObject(response.likes.data);
		basicInfo.favorite_teams = handleObject(response.favorite_teams);
		displayBasicInfo(basicInfo);
	});
	getRequest.fail(function(getResult, getStatus){
		handleAppFailure(getResult);
	});
	getRequest.always(function(){

	});
}

/*	Function that makes api call to get photo albums info
	@params - 
	@HTTP method - GET
	@return - Object that holds photos info info (We are using Object constructor to construct object)
*/
function getUserPictures(){
	var getRequest = $.ajax({
		url : buildHostUrl('me','albums.limit(5){name, photos.limit(2){name, picture, tags.limit(2)}},posts.limit(5)'),
		type : 'GET'
	});
	getRequest.done(function(response){
		console.log(response);
	});
	getRequest.fail(function(getResult, getStatus){
		handleAppFailure(getResult);
	});
	getRequest.always(function(){

	});	
}
/*	Function that makes api call to get the feed data of user
	@params - 
	@HTTP method - GET
	@return - Object that holds feed details 
*/
function getUserFeed(filters){
	var getRequest = $.ajax({
		url : buildHostUrl('me','feed',filters),
		type : 'GET',
		beforeSend : function(){
			$('#loading-icon').attr('src','images/spinner.svg');
		}
	});
	getRequest.done(function(response){
		var feed = new Object();
		if(response.hasOwnProperty('feed') && response.feed.hasOwnProperty('data')){
			feed.data = new Array();
			for(var node=0;node<response.feed.data.length;node++){
				if(response.feed.data[node].hasOwnProperty('story')){
					var tmpArr = new Array();
					tmpArr['story'] = response.feed.data[node].story;
					tmpArr['created_date'] = formatDate(response.feed.data[node].created_time);
					tmpArr['message'] = response.feed.data[node].hasOwnProperty('message') ? response.feed.data[node].message : '';
					feed.data.push(tmpArr);
				}
			}
			if(response.feed.hasOwnProperty('paging')){
				feed.previous = response.feed.paging.hasOwnProperty('previous') ? response.feed.paging.previous : '';
				feed.next = response.feed.paging.hasOwnProperty('next') ? response.feed.paging.next : '';
			}
			return displayFeedInfo(feed);
		}else{
			displayUserMessage('Something went wrong while retrieving feed data','error');
		}
	});
	getRequest.fail(function(getResult, getStatus){
		handleAppFailure(getResult);
	});
	getRequest.always(function(){
		$('#loading-icon').removeAttr('src');
	});
}

function formatDate(str){
	date = new Date(str);
	return date.toLocaleDateString();
}
/*	Function that constructs API host url
	@params	-	query nodes and fields that has to be fetched
	@return	-	string formatted url

*/
function buildHostUrl(nodes,fields,filters){
	if(typeof(filters) == 'undefined'){
		return host_url + "/" + nodes + "?fields=" + fields + "&access_token=" + access_token;	
	}else{
		return host_url + "/" + nodes + "?fields=" + fields + "&access_token=" + access_token + "" + filters;
	}
}

/*	Function that formats the data. Will format only name fields
	@param 	-	Either object or array which has to be formatted further
	@return -	array of formatted data
	
*/
function handleObject(arg){
	var tmpArr = new Array();
	if(Array.isArray(arg)){
		for(var i=0;i<arg.length;i++){
			arg[i].hasOwnProperty('name') ? tmpArr.push(arg[i].name) : null;
		}
		return tmpArr;
	}else if(isObject(arg)){
		for(var key in arg){
			key == 'name' ? tmpArr.push(arg[key]) : '';
		}
		return tmpArr;
	}else{
		return null;
	}
}

/*	Function that performs basic validation for whether the dataType is object or not
	@param 	-	any value that has to be validated against object
	@return -	Boolean(object ? true : false)

*/
function isObject(arg){
	if(typeof(arg) === 'object' && arg !== null){
		return true;
	}else{
		return false;
	}
}

/*	Function that handles all API call failures
	@param 	-	object of jQuery XMLHTTPRequest
	@return	-	will not return anything. will parse the object and handover it to "displayUserMessage()" 
*/
function handleAppFailure(arg){
	response = JSON.parse(arg.responseText);
	if(typeof(response) !== "undefined" && response.hasOwnProperty('error') == true){
		if(response.error.hasOwnProperty('message') == true){
			displayUserMessage(response.error.message,'error');
		}
	}
}
/*	Function that controls the display of error messages
	@param 	-	string (error message)
	@param 	-	string (error/success)
*/
function displayUserMessage(msg,type){
	$('#user-message').text(msg);
	if(type == 'error' || typeof(type) == 'undefined'){
		$('#user-message').addClass('error');
	}else{
		$('#user-message').addClass('success');
	}
}
