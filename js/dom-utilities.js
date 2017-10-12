function formatArrayValues(arr,id){
	if(arr == null){
		$('#' + id).text('null');
		return;
	}
	for(var i=0;i<arr.length;i++){
		$('#' + id).text(arr[i]);
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
	formatArrayValues(data.favorite_athlets,'fav-athlete');
}
function successOperations(){
	$('.login-container').hide();
	displayUserMessage("Access token is valid", "success")
	getUserBasicProfile();
	getUserFeed();
	$('.fb-container').show();
	$('.success').fadeOut(3000);
}