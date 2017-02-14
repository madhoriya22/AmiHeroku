$Lightning = $Lightning || {};
$Lightning._delegate = (function() {
	
	// private state
	var _application, _applicationTag, _auraContextCallback;
	var _pendingReadyRequests = [];
	var _ready = false;
	
	function ready(callback) {
		if (_ready) {
			_auraContextCallback(callback);
		} else {
			_pendingReadyRequests.push(callback);
		}
	};
	
	function addScripts(urls, onload) {
		var url = urls[0];
		urls = urls.slice(1);

		var script = document.createElement("SCRIPT");
		script.type = "text/javascript";
		script.src = url;

		if (urls.length > 0) {
			script.onload = function() {
				addScripts(urls, onload);
			};
		} else {
			script.onload = onload;
		}

		var head = document.getElementsByTagName("HEAD")[0];
		head.appendChild(script);
	};

	function addStyle(url) {
		var link = document.createElement("LINK");
		link.href = url;
		link.type = "text/css";
		link.rel = "stylesheet";

		var head = document.getElementsByTagName("HEAD")[0];
		head.appendChild(link);
	};

	function displayErrorText(error) {
		var para = document.createElement("P");
		var lines = error.split("\\n");
		for (var n = 0; n < lines.length; n++) {
			var t = document.createTextNode(lines[n]);
			para.appendChild(t);  
			var br = document.createElement("BR");
			para.appendChild(br);  
		}	

		document.body.appendChild(para);
	};
	
	return {
		use : function(applicationTag, callback, lightningEndPointURI, authToken) {
			if (_applicationTag && _applicationTag !== applicationTag) {
				throw new Error("$Lightning.use() already invoked with application: " + _applicationTag);
			}

			if (!_applicationTag) {
				_applicationTag = applicationTag;
				_pendingReadyRequests = [];
				_ready = false;

				var parts = applicationTag.split(":");
				
				var url = parts[0] + "/" + parts[1] + ".app?aura.format=JSON&aura.formatAdapter=LIGHTNING_OUT";
							
				if (lightningEndPointURI) {
					url = lightningEndPointURI + "/" + url;
				} else {
					// Extract the base path from our own <script> include to adjust for LC4VF/Communities/Sites
					var scripts = document.getElementsByTagName("script");
					for (var m = 0; m < scripts.length; m++) {
						var script = scripts[m].src;
						var i = script.indexOf("/resource/SEDreamin__SLDS0121/lightning.out.js");
						if (i >= 0) {
							var basePath = script.substring(0, i);
							url = basePath + "/" + url;
							break;
						}
					}
				}

				var xhr = new XMLHttpRequest();		
				
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4 && xhr.status == 200) {
						var errorMarker = xhr.responseText.indexOf("/*ERROR*/");
						if (errorMarker == -1) {
							var config = JSON.parse(xhr.responseText);
							
							// save the delegate version to local storage
							try {
								localStorage.lightningOutDelegateVersion = config.delegateVersion;
							} catch (e) {}
							
							addScripts(config.scripts, function() {
								if (config.auraConfig) {
									$A.initAsync(config.auraConfig);
								} else {
									// Backward compatibility with 198
									$A.initConfig(config.auraInitConfig, true);
									$Lightning.lightningLoaded();
								}
							});
							
							var styles = config.styles;
							for (var n = 0; n < styles.length; n++) {
								addStyle(styles[n]);
							}
						} else {
							// Strip aura servlet error markers
							var startIndex = (xhr.responseText.startsWith("*/")) ? 2 : 0;
							var jsonExcptn = xhr.responseText.substring(startIndex,errorMarker);
							jsonExcptn = jsonExcptn.replace(/\\n/g, "\\\\n"); // preserve newlines inside json stringified values by escaping them
							var exceptn = JSON.parse(jsonExcptn);
							displayErrorText(exceptn.message);
						}
					}
				};

				xhr.open("GET", url, true);
				
				if (authToken) {
					xhr.withCredentials = true;
					xhr.setRequestHeader("Authorization", "OAuth " + authToken);
				}
				
				xhr.send();
			}

			if (callback) {
				ready(callback);
			}
		},

		ready : ready,
		
		createComponent : function(type, attributes, locator, callback) {
			// Check to see if we know about the component - enforce aura:dependency
			// is used to avoid silent performance killer
			var unknownComponent;
			try {
				unknownComponent = $A.componentService.getDef(type) === undefined;
			} catch (e) {
				if ("Unknown component: markup://" + type === e.message) {
					unknownComponent = true;
				} else {
					throw e;
				}
			}

			if (unknownComponent) {
				$A.warning("No component definition for " + type + " in the client registry - for best performance add <aura:dependency resource=\"" 
						+ type + "\"/> to your extension of "
						+ _applicationTag + ".");
			} 
				
			_auraContextCallback(function() {
				var config = {
					componentDef : "markup://" + type,
					attributes : {
						values : attributes
					}
				};

				$A.createComponent(type, attributes, function(component, status, statusMessage) {
					var error = null;

					var stringLocator = $A.util.isString(locator);
					var hostEl = stringLocator ? document.getElementById(locator) : locator;

					if (!hostEl) {
						error = "Invalid locator specified - "
								+ (stringLocator ? "no element found in the DOM with id=" + locator : "locator element not provided");
					} else if (status !== "SUCCESS") {
						error = statusMessage;
					}

					if (error) {
						throw new Error(error);
					}

                    $A.util.addClass(hostEl,"slds-scope");
					$A.render(component, hostEl);
					$A.afterRender(component);
					
					hostEl.setAttribute("data-ltngout-rendered-by", component.getGlobalId());

					if (callback) {
						callback(component, status, statusMessage);
					}
				});
			});
		},

		lightningLoaded : function(application, auraContextCallback) {
			if (!_application) {
				_application = application;
				_auraContextCallback = auraContextCallback;

				if (!document.getElementById("auraErrorMessage")) {
					var div = document.createElement("DIV");
					div.id = "auraErrorMessage";
					document.body.appendChild(div);
				}

				for (var n = 0; n < _pendingReadyRequests.length; n++) {
					_pendingReadyRequests[n]();
				}
				
				_ready = true;
			}
		},
		
		getApplication : function() {
			return _application;
		}
	};
 
})(); 
