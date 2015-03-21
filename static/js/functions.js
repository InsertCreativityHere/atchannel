

/**
 * Function for actually resizing a row
 */
function changeRow(that, properties){
    var nextProperties = $.extend({}, defaultProperties, properties);
    that.css({
        "font-size": nextProperties["font-size"],
        "margin-left": nextProperties["margin-left"],
        "margin-right": nextProperties["margin-right"]
    });
    that.find(".bubble").css({
        "width": nextProperties["bubbleWidth"]
    });
    that.find(".avatar").css({
        "width": nextProperties["avatarWidth"]
    });
    that.find(".anime-time").css({
        "font-size": nextProperties["time-font-size"]
    });
}



function getPosts(){
    $.get("/getPosts", {channel: channel, start: messagesCount, length: nextAmount}).done(function(response){
        messagesCount += response.messages.length;

        if (response.messages.length < nextAmount){
            $(".load-prev").parent().remove();
        }
        else {
            $("#marker").after(response.html);

            largestPostNumber = parseInt($(".chat-row .postNumber").last().text());
            smallestPostNumber = parseInt($(".chat-row .postNumber").first().text());
            setTimeline();

            if (canAnimate)
                hideAndSeek();
            else if (md.mobile() && currentStyle === styles.vn)
                changeRow($(".chat-row"), vnMobileProperties);
            else
                changeRow($(".chat-row"), maxProperties);

            setStyle(currentStyle);
        }
    }).fail(function(jqXHR, textStatus, errorThrown){
        alert([textStatus, errorThrown]);
    });
}


/**
 * Function for choosing the rows to resize
 */
function hideAndSeek(){
    if (canAnimate && currentStyle !== styles.vn){
        // limit the rows to resize only to those onscreen
        var rows = $(".chat-row").filter(function(index){
        	var top = $(this).position().top;
            return top+$(this).outerHeight() > 0 && top < ph;
        });
        changeRow($(".chat-row").not(rows));
        rows.each(function(index){
            hidingFunction($(this));
        });
    }
}


/**
 * Function for choosing how to resize each row
 */
function hidingFunction(that){

    // Track distance between each initial top position and
    // original center of screen. If the distance is greater than
    // a specified fraction of the screen height, make it disappear
    var midDist = Math.abs(that.position().top - mid);

    if (midDist > limit+buffer){
        changeRow(that);
    }
    else if (midDist < buffer) {
        changeRow(that, maxProperties);
        currentRow = $(".chat-row").index(that);
    }
    else {
        /**
         * property = (max-default)/limit*(midDist-buffer) + max
         */
        var properties = {
            "font-size": ( ( defaultPropertiesNumeric["font-size"]-maxPropertiesNumeric["font-size"] )/limit*(midDist-buffer) + maxPropertiesNumeric["font-size"] ) + "px",
            "bubbleWidth": ( ( defaultPropertiesNumeric["bubbleWidth"]-maxPropertiesNumeric["bubbleWidth"] )/limit*(midDist-buffer) + maxPropertiesNumeric["bubbleWidth"] ) + "%",
            "margin-left": ( ( defaultPropertiesNumeric["margin-left"]-maxPropertiesNumeric["margin-left"] )/limit*(midDist-buffer) + maxPropertiesNumeric["margin-left"] ) + "%",
            "margin-right": ( ( defaultPropertiesNumeric["margin-right"]-maxPropertiesNumeric["margin-right"] )/limit*(midDist-buffer) + maxPropertiesNumeric["margin-right"] ) + "%",
            "avatarWidth": ( ( defaultPropertiesNumeric["avatarWidth"]-maxPropertiesNumeric["avatarWidth"] )/limit*(midDist-buffer) + maxPropertiesNumeric["avatarWidth"] ) + "%",
            "time-font-size": ( ( defaultPropertiesNumeric["time-font-size"]-maxPropertiesNumeric["time-font-size"] )/limit*(midDist-buffer) + maxPropertiesNumeric["time-font-size"] ) + "px"
        };
        changeRow(that, properties);
    }

}


function isAlphaNumeric(input){
    return !/[^a-zA-Z0-9]/.test(input);
}


/**
 * Color the tick that is the closest to the current row
 * If an index is provided, that will be marked
 */
function markTimeline(index){
    if (typeof index === "undefined"){
        if ($(".timeline a[data-index='" + currentRow + "']").length > 0){
            $(".timeline li").css("background-color", "initial");
            $(".timeline a[data-index='" + currentRow + "']").parent().css("background-color", "#abdfde");
        }
    }
    else {
        $(".timeline li").css("background-color", "initial");
        $(".timeline li:eq(" + index + ")").css("background-color", "#abdfde");
    }
}


/**
 * Send a message to the server and refresh on success
 */
function postMessage(){
	var m = $(".message").val().trim();
	if (m !== ""){
	    $.post("/addPost", {channel: channel, name: name, time: Date.now(), message: m}).done(function(response){
	        if (response !== ""){
	            alert(response);
	        }
	        else {
	        	// success
	        	location.reload();
	        }
	    }).fail(function(jqXHR, textStatus, errorThrown){
	        alert([textStatus, errorThrown]);
	    });
	}
}


/**
 * Function for choosing a random element in an array
 */
function randElem(array){
    return array[Math.floor(Math.random()*array.length)];
}


/**
 * Set parent top, parent height, and the screen's fixed midpoint (vertically)
 */
function resetParentDimensions(){
    pt = $(".chat").position().top; // parent top
    ph = $(".chat").height(); // parent height
    mid = pt + ph/2 - bottomBuffer;
}



/**
 * Scroll to a row until it's equal to the current row
 */
function scrollToPost(dest,callback){
    if (currentRow !== dest){
	    $(".chat").animate({
	        scrollTop: $(".chat").scrollTop() + $(".chat-row:eq(" + dest + ")").position().top - ph/2
	    }, "fast", function(){
	    	scrollToPost(dest, callback);
	    });
    }
    else if (typeof callback !== "undefined") {
    	callback();
    }
}
function scrollToPrevPost(){
    $(".chat").animate({
        scrollTop: $(".chat").scrollTop() - $(".chat-row:eq(" + (currentRow-1) + ")").outerHeight()
    }, "fast");
}
function scrollToNextPost(){
    $(".chat").animate({
        scrollTop: $(".chat").scrollTop() + $(".chat-row:eq(" + (currentRow+1) + ")").outerHeight()
    }, "fast");
}


/**
 * Function for setting the colors of each of the bubbles
 */
function setBubbleColors(){
	$(".chat-row .bubble").each(function(){
		var color = $(this).data("color");
		$(this).css({
			"background-color": color,
			"border-color": "transparent " + color
		});
	});
}


/**
 * Function for saving the current style
 */
function setStyle(style){
    sessionStorage.setItem("style", style);
    currentStyle = style;

    // stuff to do after changing the styles
    if (style === styles.anime){
        $("body").removeClass("vn").addClass("anime");
        $("#background-image").show();

    	setBubbleColors();

        if (canAnimate)
            hideAndSeek();
        else if (md.mobile() && currentStyle === styles.vn)
            changeRow($(".chat-row"), vnMobileProperties);
        else
            changeRow($(".chat-row"), maxProperties);

        setTimeline();
    }
    else if (style === styles.vn){
        $("body").removeClass("anime").addClass("vn");
        $("#background-image").hide();

        // Remove all inline styles
        $(".chat-row *").removeAttr("style");
        $(".chat-row").removeAttr("style");

        if (md.mobile()){
            changeRow($(".chat-row"), vnMobileProperties);
        }
    }
}


/**
 * Initliaze the timeline whenever
 */
function setTimeline(){
    if (currentStyle === styles.anime){
    	// Fill the timeline with ticks
        var ticHeight = 30; // the height of each li element in px
        var ticCount = parseInt((window.innerHeight-50)/ticHeight)+1;
        var postGap = parseFloat( (largestPostNumber-smallestPostNumber+1)/ticCount );
        $(".timeline").empty();
        var lastNumber = -1;
        for (var i = 0; i < ticCount; i++){
            var index = Math.ceil(postGap*i);

	        // ensure the line doesn't go past the total number of posts
	        if (index > $(".chat-row").length-1)
	            break;

            // ensure no duplicate numbers are shown
            if (index !== lastNumber){
                $(".timeline").append("<li><a href='javascript: void(0)' data-index='" + index + "'>" + (index+smallestPostNumber) + "</a> -</li>");
            }

            lastNumber = index;
        }

        // Mark the tick of the current row
        markTimeline();

        $(".timeline a").click(function(){
            var index = parseInt($(this).data("index"));
            if (canAnimate){
                scrollToPost(index, markTimeline);
            }
            else {
                currentRow = index;
                window.location.href = "#post" + (index+smallestPostNumber);
            }
        });
    }
}


/**
 * Set the username
 */
function setUsername(){
    var input = $("#selected-user-name").val().trim();
    if (input !== ""){
        name = input;
        localStorage.setItem("atchannelUsername", name);
        $(".message").attr("placeholder", "Post message as '" + name + "'");
        $("#settings-modal").modal("hide");
    }
    else if (!isAlphaNumeric(input)){
        alert("Please enter alphanumeric characters only");
    }
}


/**
 * Post a new channel to be made for the database
 */
function submitChannel(){
    var channelName = $("#new-channel-name").val().trim();
    if (channelName !== "" && isAlphaNumeric(channelName)){
	    $.post("/addChannel", {channel: channelName}).done(function(response){
	        if (response !== ""){
	            alert(response);
	        }
	        else {
	        	// success
	        	window.location.replace("/" + channelName);
	        }
	    }).fail(function(jqXHR, textStatus, errorThrown){
	        alert([textStatus, errorThrown]);
	    });
	}
	else {
		alert("Please enter alphanumeric characters only");
	}
}


/**
 * Function for setting canAnimate into session storage
 */
function setCanAnimate(animate){
    canAnimate = animate;
    sessionStorage.setItem("canAnimate", canAnimate);

    if (canAnimate){
        $(".chat").css({
            "height": "calc(100% - 50px)",
            "overflow-y": "scroll"
        });
        resetParentDimensions();

        hideAndSeek();
    }
    else {
        $(".chat").css({
            "height": "auto",
            "overflow-y": "visible"
        });

        if (md.mobile() && currentStyle === styles.vn) {
            changeRow($(".chat-row"), vnMobileProperties);
        }
        else {
            changeRow($(".chat-row"), maxProperties);
        }
    }
}


