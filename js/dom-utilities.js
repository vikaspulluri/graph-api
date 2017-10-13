function formatArrayValues(arr,id){
	if(arr == null){
		$('#' + id).text('null');
		return;
	}
	for(var i=0;i<arr.length;i++){
		$('#' + id).append(arr[i] + ' ');
	}
}

function displayBasicInfo(data){
	$('#first-name').text(data.first_name);
	$('#hometown').text(data.hometown);
	$('#gender').text(data.gender);
	$('#email').text(data.email);
	$('#user-name').text(data.name);
	$('#birthday').text(data.birthday);
	formatArrayValues(data.favorite_teams,'fav-team');
	formatArrayValues(data.likes,'likes');
	formatArrayValues(data.favorite_athlets,'fav-athlete');
}
displayFeedInfo = function(feed){
	for(var i=0;i<feed.data.length;i++){
		$('#feed').append('<div class="feed-' + i + '"></div>')
				  .append('<div class="feed-story">' + feed.data[i].story + '</div>')
				  .append('<span class="posted-time">' + feed.data[i].created_date + '</span>')
				  .append('<span class="feed-message">' + feed.data[i].message + '</span>');
	}
	$('#feed').append('<div class="feed-next" id="next" data="' + feed.next+ '">Load more</div>');
}
function successOperations(){
	$('.login-container').hide();
	displayUserMessage("Access token is valid", "success")
	getUserBasicProfile();
	$('.fb-container').show();
	$('.success').fadeOut(3000);
	getUserFeed();
}
