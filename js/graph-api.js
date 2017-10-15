/*	@Author : Vikas Pulluri <vikasiiitn@gmail.com>
	@Date : Oct 16 2017
	@File : JS file includes all the API call functions and utility functions that handle data 
*/

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
	$('#submit').on('click',function(){
		access_token = $('#access-token').val();
		/*  This section will execute only after isAccessTokenValid() is completed. 
			Since isAccessTokenValid() is using asynchronous call and JS parser will not wait until it gives back response, we are using $.when function
		*/
		$.when(isAccessTokenValid()).done(function(resp){
			if(resp.id){
				initializeFb();
			}else{
				handleAppFailure(resp);
				return false;
			}
		});
	});
	/*	* Adding an event function to Get user feed button
		
	*/
	$('#user-feed-link').on('click',function(){
		getUserFeed();
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

/*	Function that makes api call to get the feed data of user. It doesn't include any images
	@params - {string} filters - this is @param is needed to get the next page feed data where the structure of API url is little different
			- To get paginated data, along with access_token, we need to add some more query params. This filters will handle that  
	@HTTP method - GET
	@return - {Object} - that holds feed details 
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
		$('#user-feed-link').css('display','none');
		if(response.hasOwnProperty('feed') && response.feed.hasOwnProperty('data')){
			buildFeedData(response.feed);
		}else if(response.hasOwnProperty('data')){
			buildFeedData(response);
		}
		else{
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
/*	Function to get the images of feed data along with the likes of the post by using post_id
	@param - {string} post_id
	@return - {first class function} displayFeedPhotos(post_details)
*/
function getFeedPostDetails(post_id){
	var getRequest = $.ajax({
		url : buildHostUrl(post_id,'attachments,likes.limit(1).summary(true)'),
		type : 'GET',
	});
	getRequest.done(function(response){
		var post_details = new Object();
		if(response.hasOwnProperty('attachments')){
			post_details.data = new Array();
			for(var i=0;i<response.attachments.data.length;i++){
				var tmpArr = new Object();
				if(response.attachments.data[i].hasOwnProperty('media') && response.attachments.data[i].media.hasOwnProperty('image')){
					tmpArr.image_url = response.attachments.data[i].media.image.src;
				}else{
					tmpArr.image_url = null;
				}
				tmpArr.type = response.attachments.data[i].type;
				post_details.data.push(tmpArr);
			} 
		}
		post_details.id = response.id;
		if(response.hasOwnProperty('likes')){
			post_details.like_count = response.likes.summary.total_count;
		}
		return displayFeedPhotos(post_details);
	});
	getRequest.fail(function(getResult, getStatus){
		handleAppFailure(getResult);
	});
	getRequest.always(function(){

	});	
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////
//	Utility functions will goes here 
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////

/*	Function that converts the date in UTC format to locale format string
	@params - {string} str
	@return - {string}
	
*/
function formatDate(str){
	date = new Date(str);
	return date.toLocaleDateString();
}

/*	Function that constructs API host url
	@params	-	{string} nodes
	@params -	{string} fields
	@params -	{string} filters
	@return	-	{string} url

*/
function buildHostUrl(nodes,fields,filters){
	if(typeof(filters) == 'undefined'){
		return host_url + "/" + nodes + "?fields=" + fields + "&access_token=" + access_token;	
	}else{
		return url;
	}
}

/*	Function that formats the data. Will format only name fields
	@param 	-	{object/array} Either object or array which has to be formatted further
	@return -	{array} array of formatted data
	
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
	@param 	-	{object} arg - object of jQuery XMLHTTPRequest
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
	@param 	-	{string} msg - (error message)
	@param 	-	{string} type - (error/success)
*/
function displayUserMessage(msg,type){
	$('#user-message').text(msg);
	if(type == 'error' || typeof(type) == 'undefined'){
		$('#user-message').addClass('error');
	}else{
		if($('#user-message').hasClass('error')){
			$('#user-message').removeClass('error');
		}
		$('#user-message').addClass('success');
	}
}
/*	Function that formats the data returned by getUserFeed() function.
	@param - {object} arg
	@return - {first class function} displayFeedInfo(feed)
*/
function buildFeedData(arg){
	var feed = new Object();
	feed.data = new Array();
	if(arg.hasOwnProperty('data')){
		for(var node=0;node<arg.data.length;node++){
			if(arg.data[node].hasOwnProperty('story')){
				var tmpArr = new Array();
				tmpArr['story'] = arg.data[node].story;
				tmpArr['created_date'] = formatDate(arg.data[node].created_time);
				tmpArr['message'] = arg.data[node].hasOwnProperty('message') ? arg.data[node].message : '';
				tmpArr['id'] = arg.data[node].hasOwnProperty('id') ? arg.data[node].id : '';
				feed.data.push(tmpArr);
			}
		}
		if(arg.hasOwnProperty('paging')){
			feed.previous = arg.paging.hasOwnProperty('previous') ? arg.paging.previous : '';
			feed.next = arg.paging.hasOwnProperty('next') ? arg.paging.next : '';
		}
	}
	return displayFeedInfo(feed);	
}
