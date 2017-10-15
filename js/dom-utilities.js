/*	@Author : Vikas Pulluri <vikasiiitn@gmail.com>
	@Date : Oct 16 2017
	@File : JS file includes all the DOM manipulation functions 
*/

//$('.fb-container').on('click','div.next',function(){
	//url = $('div.next').attr('data');
	//$('#feed').empty();
	//getUserFeed(url);
//});

/*  Function that will append array data into div.
	@param - {array} arr
	@param - {string} id
*/
function addToDiv(arr,id){
	if(arr == null){
		$('#' + id).text('null');
		return;
	}
	for(var i=0;i<arr.length;i++){
		$('#' + id).append(arr[i] + ' ');
	}
}
/*	Function to inject the basic info of the user into HTML DOM
	@param - {object} data
*/
function displayBasicInfo(data){
	$('#first-name').text(data.first_name);
	$('#hometown').text(data.hometown);
	$('#gender').text(data.gender);
	$('#email').text(data.email);
	$('#user-name').text(data.name);
	$('#birthday').text(data.birthday);
	addToDiv(data.favorite_teams,'fav-team');
	addToDiv(data.likes,'likes');
	addToDiv(data.favorite_athlets,'fav-athlete');
}

/*	First class function to inject feed data into HTML DOM
	@param - {object} feed
*/
displayFeedInfo = function(feed){
	feedCount = $("div[class^=feed-]").length
	for(var i=0;i<feed.data.length;i++){
		//formattedPhoto = feed.data[i].photo.hasOwnProperty('data') ? formatPhoto(feed.data[i].photo.data) : '';
		if($('.feed').find('#' + feed.data[i].id).length == 0){
			var itemDisplay = $('<div/>').addClass('feed-' + feedCount).attr('id',feed.data[i].id)
					  .append($('<div/>').addClass('story').text(feed.data[i].story))
					  .append($('<div/>').addClass('posted-time').text(feed.data[i].created_date))
					  .append($('<div/>').addClass('message').text(feed.data[i].message))
			$('#feed').append(itemDisplay);
			feedCount++;
		}
	}
	var next = feed.next != '' ? $('<div/>').attr({'class':'next','id':'next','data':feed.next}).text('Load more') : ' ';
	$('#load-more').html(next);
	getFeedPhotos();
}

/*	Function that manipulated DOM elements and perform necessary calls after successful validation of access_token 

*/
function initializeFb(){
	$('.login-container').hide();
	$('.fb-container').attr('style','display:block !important');
	displayUserMessage("Access token is valid", "success")
	getUserBasicProfile();
	$('.fb-container').show();
	$('.success').fadeOut(4000);
}

/*	First class function to handle array of image objects
	@param - {array} arg
	@return - {DOM object}
*/
formatPhoto = function(arg){
	if(Array.isArray(arg)){
		for(var i=0;i<arg.length;i++){
			return '<img src="' + arg[i].image_url + '">';
		}
	}
}

/*	Function that calls an api and get the images and likes count for each of the post

*/
getFeedPhotos = function(){
	$("div[class^=feed-]").each(function(){
		var obj = new Object();
		var id = $(this).attr('id');
		getFeedPostDetails(id);
	});	
}

/*	Function that injects the images and likes count into the respective post div
	@param - {object} feed

*/
displayFeedPhotos = function(feed){
	var itemDisplay = $('<div/>').addClass('likes').text(feed.like_count);
	if(feed.hasOwnProperty('data') && feed.data[0].hasOwnProperty('image_url')){
		itemDisplay.append($('<img/>').addClass('image').attr('src',feed.data[0].image_url));
	}
	var postId = '#' + feed.id;
	if($(postId).find('.likes').length == 0)
		$(postId).append(itemDisplay);
}

/*	Function to get more feed data while user scrolled down to bottom 

*/
$(window).scroll(function() {
   if($(window).scrollTop() + $(window).height() == $(document).height()) {
        filters = $('div.next').attr('data');
		getUserFeed(filters);
   }
});