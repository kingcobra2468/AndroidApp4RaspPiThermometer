Inflow = (function() {
	var presenceInitiated = false;

	function addScript(tag, src, wtcallback, attributes) {
		var s = document.createElement(tag);
		if(src) {
			s.setAttribute('src', src);
		}
		
		if (attributes) {
			for ( var key in attributes) {
				s.setAttribute(key, attributes[key]);
			}
		}

		s.onload = function() {
			if (wtcallback && typeof wtcallback === "function") {
				wtcallback.call();
			}
		};
		
		document.head.appendChild(s);
	}

	function getQueryParameters(str) {
		 return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
	}
	
	
	function hideCoBrowseButton(){
		var cobrowseButton = document.getElementById("start-cobrowse"); 
		var glanceStopButton = document.getElementById("glance_stop_btn");

		if(glanceStopButton && cobrowseButton )
			cobrowseButton.style.display = "none";
		if(glanceStopButton )
			glanceStopButton.classList.remove("insession");
	}
	function showCoBrowseButton(){
		var cobrowseButton = document.getElementById("start-cobrowse"); 
		var glanceStopButton = document.getElementById("glance_stop_btn");
		if(cobrowseButton )
			cobrowseButton.style.display = "block";
		if(glanceStopButton )
			glanceStopButton .classList.add("insession");
	}
	
	return {
		
		handleErrors: function (inputError) {
			$.fn.refreshInflowOnError(null, null, null, null,inputError.errorCode,inputError.errorMessage,inputError.errorString,inputError.checkoutSessionId);   
		} ,

		handleRefresh: function (inputJSON) {
			$.fn.refreshInflow(inputJSON);   
		} ,
		
		initPresence: function (userId) {
			var glanceMetaTag = document.getElementById("cobrowsescript");
			if(glanceMetaTag){
				if (userId != null && presenceInitiated === false) {
					var presencevisitor = new GLANCE.Presence.Visitor({
						groupid : glanceMetaTag.getAttribute("data-groupid"),
						visitorid : userId
					});
					presencevisitor.presence();
					presencevisitor.connect();
					presenceInitiated = true;
				}  
			}
		} ,
		
		cb : function(data) {
			var infinputjson = JSON.parse(data.inputJSON);
	
			if (data.enabledForWebTagging) {
				var webTaggingUrl = data.webTaggingUrl;
				var wtcallback = function() {
					startWebTagging(data.userName, data.puid, data.phoneNo);
				};
				addScript('script', webTaggingUrl, wtcallback);
			}
			
			var glanceMetaTag = document.getElementById("cobrowsescript");
			if (data.enabledForCobrowsing && (glanceMetaTag === null || glanceMetaTag === "undefined")){
			    var css = '<style>#glance_stop_btn.insession:before {content: "Stop Sharing";}#start-cobrowse {background:none!important;color:#0654ba;border:none;padding:0!important;font: inherit;border-bottom:1px solid #0654ba;cursor: pointer;}</style>',
			    head = document.head || document.getElementsByTagName('head')[0],
			    style = document.createElement('style');
				style.type = 'text/css';
				if (style.styleSheet){
				  style.styleSheet.cssText = css;
				} else {
				  style.appendChild(document.createTextNode(css));
				}
				head.appendChild(style);
	

				var metaAtrribute = {};
	//			var metaAtrribute = "";
				
				metaAtrribute["id"] = "cobrowsescript";
				metaAtrribute["data-ws"] = "ebay.glance.net";
				metaAtrribute["data-presenceserver"] = "ebay-presence.glance.net" ;
				metaAtrribute["data-termsurl"] = "https://pages.ebay.com/termsandconditions/co-browse.html";  
				metaAtrribute["data-groupid"] = data.coBrowseGroupId;
				metaAtrribute["data-site"] = data.environment;
				metaAtrribute["data-scriptserver"] = data.coBrowseURL;
	
				var scriptAttributes = {
				    "data-termsurl": "https://pages.ebay.com/termsandconditions/co-browse.html",
				    "data-groupid": data.coBrowseGroupId,
				    "data-site": data.environment,
				    "charset": "UTF-8"
				};
				
				var isNative = false;
				var ocsPlatformId = data.enabledForStaticPresence ? document.getElementById("ocsPlatformId") : undefined;
				if(ocsPlatformId) {
					isNative = ocsPlatformId.value === '1' || ocsPlatformId.value === '2';
				}
				//presence for callus and call me on helphub.
				if (data.enabledForStaticPresence && isNative === false) {
					metaAtrribute['data-presence'] = "on"; 
					metaAtrribute['data-visitorid'] = data.presentationUserId;
					scriptAttributes["data-presence"] = "on";
					scriptAttributes["data-visitorid"] = data.presentationUserId;
				} else {
					var coBrowseContainer = document.getElementById("cobrowseph");
					if(coBrowseContainer)
						coBrowseContainer.innerHTML = ('<button id="start-cobrowse" glance_button="showTerms">Start sharing</button>'); 
				    metaAtrribute['data-presence']="api";
				    scriptAttributes["data-presence"] = "api";
				}
	
				addScript('meta', null, null, metaAtrribute);
				
				addScript('script', (data.coBrowseURL + '/js/' + data.coBrowseLoaderJS + '?group=' + data.coBrowseGroupId + '&site=' + data.environment), function() {
				    if (GLANCE && GLANCE.Cobrowse.Visitor.addEventListener) {
				        GLANCE.Cobrowse.Visitor.addEventListener("sessionstarting", function(data) {
				            hideCoBrowseButton();
				        });
				        GLANCE.Cobrowse.Visitor.addEventListener("sessionstart", function(data) {
				            hideCoBrowseButton();
				        });
				        GLANCE.Cobrowse.Visitor.addEventListener("error", function(data) {
				            showCoBrowseButton();
				        });
				        GLANCE.Cobrowse.Visitor.addEventListener("agents", function(data) {
				            hideCoBrowseButton();
				            var glanceStopButton = document.getElementById("glance_stop_btn");
				            if(glanceStopButton)
				            	glanceStopButton.classList.add("insession");
				        });
				        GLANCE.Cobrowse.Visitor.addEventListener("sessionend", function() {
				            showCoBrowseButton();
				        });
				        GLANCE.Cobrowse.Visitor.addEventListener("sessioncontinue", function(data) {
				            hideCoBrowseButton();
				        });
				        GLANCE.Cobrowse.Visitor.addEventListener("connection", function(data) {
				            hideCoBrowseButton();
				        });
				    }
				}, scriptAttributes);
			}
	
			if(typeof jQuery !== "undefined"){
					
				window.$ = jQuery;
				
				if (infinputjson && data.inflowParameterUrl){				
					infinputjson = $.extend( {}, infinputjson, getQueryParameters(data.inflowParameterUrl));
				}
				if (data.enabledForDolores) {
					if (data.serviceResponse != null) {
						try {
							infinputjson.serviceResponse = JSON.parse(data.serviceResponse);
						} catch (err) {
						}
					}
					
					infinputjson.disableBotIcon = infinputjson.disableBotIcon || false;
					if (Boolean(infinputjson.disableBotIcon) === true && window.BotObj && typeof window.BotObj === "object") {
						if (window.BotUtils && typeof window.BotUtils === "object") {
							window.BotUtils.contentMap = JSON.parse(data.doloresContent);
						}
						return;
					}
					var dolorescssstyle = "<style>" + data.dolorescss + "</style>";
					$('body').append(dolorescssstyle);
					var BotObj = new Bot({
						"user" : data.presentationUserId,
						"siteId" : (data.siteId).toString(),
						"ocs" : data.ocs,
						"isOpen" : data.open,
						"endPoint":data.helpBotUrl,
						"deviceType":data.doloresDeviceType,
						"content":data.doloresContent,
						"historyAvailable":data.historyAvailable,
						"pageId":data.pageId,
						"nativePage":data.doloresNativePage,
						"botToolTip":data.botToolTip,
						"convInflowEnabled":data.convInflowEnabled,						
						"infinputjson" :infinputjson,
						"dfflow" :data.dfflow
					});
					if (infinputjson.disableBotIcon){
						window.BotObj = BotObj;
					}
				} else {
	
					if (data.enabledForInflowHelp) {
						if (data.infhtml != null && data.infcss != null) {
							var parentElement = $("#mainContent").length? $("#mainContent") : $("body");  

							if(data.pageId && data.pageId == "4642"){
								parentElement = $("body");
							}
							
							if (infinputjson && infinputjson.ifhContainerId && $("#" + infinputjson.ifhContainerId).length) {
								parentElement = $("#" + infinputjson.ifhContainerId);
							}
							
							parentElement.append(
									"<div id=infcontainer>" + data.infhtml
									+ "</div>");
						}
						var cssstyle = "<style>" + data.infcss + "</style>";
						var content = '<script type="text/template" id="inflow-template-content"> //<![CDATA['
								+ data.content + '//]]><\/script>';
						var deviceType = '<input type="hidden" id="deviceType" value = '
								+ data.deviceType + '>';
						var timeout = '<input type="hidden" id="ocsTimeout" value = '
								+ data.timeout + '>';
						var serviceUrl = '<input type="hidden" id="ocsServiceUrl" value = '
								+ data.serviceUrl + '>';
						$("#infcontainer").append(cssstyle);
						$("#infcontainer").append(content);
						$("#infcontainer").append(deviceType);
						$("#infcontainer").append(timeout);
						$("#infcontainer").append(serviceUrl);			
		                infinputjson.inflowParameterUrl = data.inflowParameterUrl;
						if (data.serviceResponse != null) {
							try {
								var serviceResponse = JSON
										.parse(data.serviceResponse);
								infinputjson.serviceResponse = serviceResponse;
								infinputjson.siteId = data.siteId;
								infinputjson.presentationUserId = data.presentationUserId;
							} catch (err) {
	
							}
						}
	
						$("#infcontainer").inflowcomponent(infinputjson);
					}
				}
			}
		}
	};
})();
/**/Inflow.cb({"inflowParameterUrl":null,"serviceResponse":null,"inputJSON":"{\"pageId\":2047675,\"gbhEnabled\":false}","siteId":0,"timeout":null,"deviceType":null,"serviceUrl":null,"doloresDeviceType":null,"doloresContent":null,"historyAvailable":false,"doloresNativePage":false,"pageId":"2047675","webTagging247JSUrl":null,"webTaggingUrl":null,"userName":null,"puid":null,"phoneNo":null,"helpBotUrl":null,"botToolTip":true,"presentationUserId":"er-101","dfflow":false,"coBrowseURL":"https://secureir.ebaystatic.com/cr/v/c1/cobrowse_4.2.0","coBrowseGroupId":"20315","coBrowseLoaderJS":"GlanceCobrowseLoader_4.2.0M.js","environment":"production","dolorescss":null,"content":null,"infcss":null,"infhtml":null,"convInflowEnabled":false,"showCobrowseButton":false,"open":false,"rlogId":"t6lfuupdvw9%3Ftiljetqvgws%28l%3Edmn*w%60ut3550-16b8cf5dd4e-0x229","ocs":false,"enabledForStaticPresence":false,"enabledForDolores":false,"enabledForWebTagging":false,"enabledForInflowHelp":false,"enabledForCobrowsing":true})