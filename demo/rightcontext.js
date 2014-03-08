/*****************************************************************************
RightContext v0.2.5
Author: Harel Malka  
http://www.harelmalka.com 
harel@harelmalka.com
Bugs: Leave comment on the site

February 2007 - Initial Revision
----------------------------------------------------------------------------

RightContext is a supercharged context menu. I created it to 
answer a few requirements I had of context menus which I could not find 
anywhere else; mainly provide the *correct* contextualized links depending 
on what was triggering the menu. Originaly this was a Right Click menu only, 
though this was changed in 0.2.4 to allow menu triggering by Left/Right Click,
or Mouse over actions. 
RightContext generates unique context menus that are built based on the DOM 
element clicked using special attributes embedded in the element's html. 
The attributes are custom generated and can be anything. Menu items can 
include [tags] referencing those attributes, which will cause them to be 
transformed to contain the actual values when the menu is constructed 
(i.e., when an element is left/right clicked or moused over, depending on 
the menu's setting.)

Some of the key features of RightClick:
	* Trigger items via Right click, Left click or Mouse over (new in 0.2.4) 
	* Menu items that link somewhere
	* Menu items that perform a custom javascript function
	* Menu items that display hardcoded text
	* Menu items that retrieve text via a remote 'ajax' call
	* Menu item separators
	* Supports multiple different menus that can be called depending on 
		the element clicked
	* All menu items can contain [tags] which are transformed at runtime to 
		the values embedded in the clicked element
	* Conditional evaluation of menu items. An item can show or not show depending
		on a specified condition in the menu template (new in v0.2.3)
	* Css based look and feel
	* Unobtrusive standalone javascript: no additional js framework required.

RightContext is the menu object. It contains a collection of context menu 
definitions which can be retrieved by unique names. A context menu will 
receive a set of arguments from any calling Context that can be used to 
construct the links or text in it. 
This is a singleton object that should have one instance per page.

A few of the object's properties that you can edit:
	menuTriggerEvent -> Can be either RIGHT (default), LEFT, or MOVE to 
						determine what triggers the menus generated (left/right
						click or a mouse over event). Value is in UPPER case.
	allowedContexts  -> A String array of tag names that can have a menu attached
						to them. The default list covers A, DIV, SPAN, INPUT tags.

A menu definition is an object with the following spec:

	menu1 = { attributes: "attr1,attr2,attr3" ,

				items: [ 
					{type:RightContext.TYPE_MENU,
						text:"Search for [attr2] on Google",
						url:"http://www.goole.com?q=[attr1]",
						image: "icon.gif", align:"right" },

					{type:RightContext.TYPE_MENU,
						text:"The second item in the menu. it will show if attr3=Y (and its: [attr3])",
						requires: ["attr3", "Y"],
						onclick:function() { alert('This is a custom javascript')} },
					
					{type: RightContext.TYPE_SEPERATOR },
					
					{type: RightContext.TYPE_TEXT,
						text: "This is hardcoded, yet dynamic text: attr1=[attr1], attr2=[attr2], attr3=[attr3]"} ,
					
					{type: RightContext.TYPE_TEXT_EXT,
						url: "external.html"}   ]
			};

Each menu definition object contains two properties: 

	attributes : a comma delimited list of attributes that this menu will 
				look for in the elements its bound to
	items      : an array of objects, each describes a menu item of a given 
				type. The example above covers all 
				currently supported types and their respective properties.   

A couple of notes about item properties:
	* Use either url or onclick for TYPE_MENU items - url will take precedence 
	over onclick. 
	* For url type menu items, you can add an optional frame property to redirect
	the link to a specific frame, or use _blank to open a new window
	* The image attribute for TYPE_MENU are optional.    
	* For TYPE_MENU, you can use the optional 'requires' property. It accepts 
	an array with two elements; the first one is an attribute to evaluate and 
	the second is what it should evaluate to if this menu item is to be displayed.

After creating some menu definitions, you need to add them to the menu 
collection within RightContext by doing:

	RightContext.addMenu("menuOne", menu1); 
	
This adds menu1 and tags it with unique name: menuOne. The unique name is how 
we'll refer to this menu later.

Not all html tags are used to allow context menus. By default, only 
A, DIV, SPAN and INPUT tags are considered 'contextualizable' but you can add 
additional tags by editing the allowedContexts property of the RightContext 
object. 

To generate a context menu for a particular html tag, first add the context 
attribute to it, and then any additional attributes that you'd like it to 
have. The context attribute holds which menu to call up.
The additional ones are the attributes defined in the attributes property of 
the menu definition. 
For the menu definition above, here's an A tag example:

	<a href="http://www.freecrm.com" context="menuOne" attr1="freecrm" 
						attr2="FreeCRM.com" attr3="Hi mum!">Right Click Me</a>
	
	The above link will use the menuOne (mapped to menu1) defintion. When 
	triggered, the first menu item will a link titled 
	"Search for freecrm on Google" ([attr1] is replaced by the tag's 
	attribute value - freecrm)
	The second item will pop a javascript alert and will be titled 
	"The second item in the menu. attr3=Hi Mum!".
	It will be followed by a separator and then the following text:
	"This is hardcoded, yet dynamic text: attr1=freecrm, attr2=FreeCRM.com,
	attr3=Hi mum!"
	The last item will retrieve the contents of the external.html file 
	provided. Obviously, you can also embed url parameters in the url as tags.
	Note that the link above will cause the second menu item to not display
	because the attr3 attribute is equal to "Hi mum!" while the menu template
	defines that the second item will only show if the attr3 is equal to Y.

You can create as many menu definitions as needed for different elements on 
your page. Simple define which menu to call in the tag's context attribute.

Finally, to kick of the party and start some context menu action going, you 
need to bind the tags that contain the context attribute to their respectful 
menus by doing: 

	RightContext.initialize();

Please see the example file provided (index.html). An example is worth 
a thousand comments...

CSS Notes:
The RightContext object makes use of some CSS classes defined in the
rightcontext.css file. You need to include that in your html, or make use
of these classes yourself.

Some credits: 
I was always on the lookout for the right context menu but was too busy (or 
lazy) to make my own. What finally broke the camel's back was a ContextMenu 
script using prototype that i found here:
http://www.ajaxline.com/node/338 (note - last i checked the link was not 
active). But, it wasn't stand alone, and it wasn't really "contextualize" 
to what's clicked. I wasn't a happy puppy, So i rolled up my sleeves. 
I used the getDimensions method from prototype since it worked great and 
saved me time doing my own. (http://prototype.conio.net)
I also adapted the logic in Alessandro Fulciniti great bubble tooltip 
script's Locate method for the locateMousePos (slightly modified)
method for the same reason (http://pro.html.it  and  
http://web-graphics.com )
Also thanks to all the good people who bothered to comment about this script.
Thanks to them I added the left click and mouse over trigger options.
In 0.2.5 I also incorporated fixes provided by Ian, CraigD, David Zhang and fanno. 
So thanks guys!

LICENSE:
This script is FREE to use and modify for personal or commercial purposes. 
I only ask that you either leave this commented message intact, OR leave 
credit where credit is due, with all URLs provided (not just to myself, 
but also to prototype and Alessandro).
As well, if you make any modifications to this script that enhances its 
functionality, please DO give them back to the world and please email them 
to me so that I can consider including them into my own version here. 
I'd also love to hear of any good use you've made with this script!

WARRANTY: 
This code comes with NO Warranty whatsoever. I cannot be help responsible
for any damage of any kind to any thing resulting from using this code.
Do NOT use this code for NASA shuttle launches! It won't work. 

Please send bug reports to rightcontext@googlemail.com

Have fun

CHANGE LOG -----------------------------------------------------------------

0.2   : 12 Feb 2007  Added support for tags in menu onclick event handlers.
					Added a couple of fixes provided by JDG including a Safari
					fix.
0.2.1 : 17 Feb 2007  Bug fix: event handler parsing was overwriting the template
					with the first parsed item.
0.2.2 : 20 Feb 2007  Bug fix: IE6-7 issue with onlclick events containing tags 
					and a menu positioning fix.
0.2.3 : 20 Feb 2007  Added conditional display of menu items based on [tag] values
0.2.4 : 26 Feb 2007  Added menu triggering via LEFT click and mouse over (MOVE)
					events.
0.2.5 : 04 Oct 2008  Fixes tags not passing properly on FF3 with onclick events.
					Also incorporates all fixes proposed by users. 
					Thanks to Ian, CraigD, David Zhang and fanno
					
****************************************************************************/

var RightContext = {
	//some final vars:
	TYPE_MENU: 0,       // menu item
	TYPE_TEXT: 1,       // inline text (non-mutable hard coded)
	TYPE_TEXT_EXT: 2,   // external text (retrived via rpc call)
	TYPE_SEPERATOR:3,   // separator line
	TYPE_ATTRIBUTES:4,  // menu attributes.

	// some simple browser detection
	browser: null,

	// set the event to trigger the menus: RIGHT,LEFT (right/left click) or mouse MOVE 
	menuTriggerEvent: "RIGHT",
	
	// object to hold temp mouse position
	mousePos: {x:0, y:0},

	// offset for menu from mouse pointer
	rightOffset: 5,
	
	// kill menu timeout - sets the timeout from mouse out to menu dissapearing
	killMenuTimeout: 25, 

	// type of html tags that can have context menus. You can edit this to 
	// allow more tags into the party.
	allowedContexts: ["a","div","span","input"],

	// object to hold a collection of menus indexed by name
	menuCollection: new Object(),

	// the currently visible context menu DIV element
	contextMenu: null,
	
	// some state machine: is the menu showing (LEFT), and should killing it be aborted (MOVE)
	isShowing: false,
	abortKill: false,
	
	// image cache
	images: new Object(),
	
	// var to hold external requests
	req: null,
	
	// initialize RightContext object 
	initialize: function () {
		this.browser = RightContext.detectBrowser();
		this.attachContextEvents();   
	},

	// adds a menu to the menuCollection
	addMenu: function (n, m) { 
		this.menuCollection[n] = m;
	},

	// return a menu from the menu collection
	getMenu: function (n) {
		return this.menuCollection[n];
	},

	// loop all context allowed tags in the document and attach menu events to 
	// those that contain the menu attribute
	attachContextEvents: function () {
		var tagContext, thisTag;
		for (var t=0; t<this.allowedContexts.length; t++) {
			tags = document.getElementsByTagName(this.allowedContexts[t]);

			for (e=0; e<tags.length; e++) {
				thisTag = tags[e];
				tagContext = thisTag.getAttribute("context");
				if (tagContext!=null && tagContext != "undefined") {
					this.bindEvent('mousemove', tags[e], function(e) { return RightContext.locateMousePos(e); });
					if (this.menuTriggerEvent=="RIGHT") {
						tags[e].oncontextmenu = function() {   return RightContext.render(this);   }; 
					} else if (this.menuTriggerEvent=="LEFT") {
						//this.bindEvent('click', tags[e],  function() {  return RightContext.render(this, tagContext);  });
						tags[e].onclick = function(e) { 
														RightContext.killBubble(e); 
														return RightContext.render(this)
													};
						tags[e].onmouseout = function(e) { setTimeout("RightContext.killMenu()", 5000);};
					} else if (this.menuTriggerEvent=="MOVE") {
						if (!document.all) {
							this.bindEvent('mouseover', tags[e], function(e) { RightContext.locateMousePos(e); return RightContext.render(this); });
							this.bindEvent('mouseout',  tags[e], function(e) { setTimeout("RightContext.killMenu()", RightContext.killMenuTimeout); });
						} else {
							tags[e].onmouseover =  function(e) { RightContext.locateMousePos(e); return RightContext.render(this); };
							tags[e].onmouseout = function(e) { setTimeout("RightContext.killMenu()", RightContext.killMenuTimeout); };
						}
					}
				}
			}
		}
	},
	
	killBubble: function(e) {
		if (!e) var e = window.event;
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
	},
	
	// binds an event handler to an object
	bindEvent: function (evt, obj, act, bubble) {
		if (!bubble) bubble = false;
		if (obj.addEventListener) {
			obj.addEventListener(evt, act, bubble);
		} else if (obj.attachEvent) {
			obj.attachEvent('on'+evt, act);
		}
	},
	

	/*
	renders a given menu and attaches it to the caller object.
	The caller is responsible to contain a few extra attributes
	that will help construct the links for this menu (i.e., provide the Context)
	*/
	render: function (caller, name) {
		var url, title;
		// if name was not specified, grab it from the caller
		// v0.2 - changed to getAttribute (used direct nodeValue access before my mistake). pointed out by JDG.
		var name = name || caller.getAttribute("context");

		// get the requested menu
		var thisMenu = this.getMenu(name);
		
		// extracts this menus attributes list and items
		var attributes = thisMenu["attributes"].split(',');   
		var items = thisMenu.items;

		// constructs a map from the callers attributes
		var objMap = this.buildAttributeMap(attributes, caller);

		// start building the menu itself, but first remove menu if visible
		this.killMenu();
		this.buildMenu(caller);
		
		// create a table to build the menu items in
		tbl = document.createElement("TABLE");
		tbl.id = "rcRightContextTable";
		
		// loop the menu items and render each according to its type
		for (var m=0; m<items.length; m++) {
			switch (items[m]["type"]) {
				case this.TYPE_MENU:
					// add the menu item
					if (this.isDisplayed(items[m], objMap)) {
						this.addMenuItem(items[m], objMap, tbl);
					}
					break;

				case this.TYPE_TEXT:
					// add fixed text
					text = this.transform(items[m]["text"], objMap);
					cell = this.addTableCell(tbl, "rcMenuItemText", text);
					break;

				case this.TYPE_TEXT_EXT:
					cell = this.addTableCell(tbl, "rcMenuItemTextExt");
					url = this.transform(items[m]["url"], objMap);
					this.request(url, function() { if (RightContext.req.readyState == 4 && RightContext.req.status == 200) { cell.innerHTML = RightContext.req.responseText } });
					break;

				case this.TYPE_SEPERATOR:
					cell = this.addTableCell(tbl);
					cell.appendChild(this.getSeparator());
					break;
				
				default:
					// no default behaviour
					break;
			}
			
		}
		// append the menu item table to the menu itself
		this.contextMenu.appendChild(tbl);
		// make sure we're not overflowed to the edge of the screen.
		this.repositionMenu();
		
		if (this.menuTriggerEvent=="MOVE") {
			this.bindEvent('mouseout',  this.contextMenu, function(e) { RightContext.abortKill = false; setTimeout("RightContext.killMenu()", RightContext.killMenuTimeout); });
			this.bindEvent('mouseover', this.contextMenu, function(e) { RightContext.abortKill = true;  });
		} else if (this.menuTriggerEvent=="LEFT" || this.menuTriggerEvent=="RIGHT") {
			this.bindEvent('click', document.body, function(e) { setTimeout("RightContext.killMenu();", RightContext.killMenuTimeout); }, false);
		} 
		this.isShowing = true;
		
		return false;
	},

	isDisplayed : function(item, objMap) {
		var reqVar, reqVal;
		var shown = true; // by default all items are shown, unless they require something 
		// lets make sure this item does not require any condition to be true in order to display
		if (item["requires"] != null && item["requires"] != "undefined") {
			// yep, this one has a requirement...
			reqVar = item["requires"][0];
			reqVal = item["requires"][1];
			if (objMap[reqVar] != null && objMap[reqVar] != "undefined") {
				// if the condition is not met, do not show this item.
				if (objMap[reqVar] != reqVal) {
					shown = false;    
				}
			} else {
				// if the condition is not defined do not show the item
				shown = false;
			}
		}
		return shown;
	},
	
	// check if the menu goes outside the window boundries and adjust its 
	// location if so
	repositionMenu: function() {
		var mPos = this.findPosition(this.contextMenu);
		var mDim = this.getDimensions(this.contextMenu);
		var winHeight = this.getWindowHeight(); // window.innerHeight || document.body.clientHeight;   
		var winWidth = window.innerWidth || document.body.clientWidth;
		if (mPos.y + mDim.height > winHeight-30 ) {
			this.position(this.contextMenu, mPos.x, mPos.y - mDim.height);
			mPos = this.findPosition(this.contextMenu);
		} 
		if (mPos.x + mDim.width > winWidth - 30 ) {
			this.position(this.contextMenu, mPos.x-mDim.width, mPos.y);
		} 
	},
	
	// returns an HR sepearator which uses the rcMenuSeparator style
	getSeparator: function () {
		var sep = document.createElement("HR");
		sep.className = "rcMenuSeparator";
		return sep;
	},
	
	// adds a table cell to the provided table and returns it.
	// attached a class if provided and initializes the cell with some content 
	// where applicable
	addTableCell: function (table, className, content) {
		row = table.insertRow(-1);
		cell = row.insertCell(0);
		if (className) { 
			cell.className = className;
			if (content) {
				cell.innerHTML = content;
			}
		}
		return cell;
	},

	// adds a menu item to the provided table. transforms all data as defined 
	// in the objMap argument
	addMenuItem: function (item, objMap, tbl) {
		var title = this.transform(item["text"], objMap);
		var url, frame, img, imgAlign, itemSrc, tmp, itemAction; 
		var cell = this.addTableCell(tbl, "rcMenuItem", title); 
		cell.style.cursor = document.all?'hand':'pointer';
		this.bindEvent('mouseover', cell, function(e) { cell.className="rcMenuItemHover";});
		this.bindEvent('mouseout',  cell, function(e) { cell.className="rcMenuItem";     });
		
		// deal with image if applicable
		if (item["image"]!=null && item["image"]!="undefined") {
			// get image alignment or default to absmiddle
			imgAlign = (item["align"]!=null && item["align"]!="undefined") ? item["align"] : "absmiddle";
			// load the image from the cache, or from disk (and then cache it)
			if (this.images[item["image"]] != null && this.images[item["image"]] != "undefined") {
				img = this.images[item["image"]];
			} else {
				img = this.loadImage(item["image"]);
			}
			// set image alignment
			img.align=imgAlign;
			// insert the image as first child of the cell
			cell.insertBefore(this.images[item["image"]], cell.childNodes[0]);
		}
		
		if (item["url"]!=null && item["url"] != "undefined") {
			url   = this.transform(item["url"],  objMap);
			frame = false;
			if (item["frame"] != null && item["frame"] != "undefined") {
				frame = item["frame"];
			}
			cell.onclick = function () { RightContext.redirect(url, frame); }
		} else {
			// we first need to find out if the event handler contains a potential 
			// tag. if so, we grab its source, transform it and re-evaluate it. 
			// if this fails, the value reverts back to its original function
			itemAction = item["onclick"]; 
			try {

				itemSrc = item["onclick"].toString();
				if (itemSrc.indexOf('[')>-1) {
						itemSrc = this.transform(itemSrc, objMap);
						eval('itemAction = ' + itemSrc);
				}
			
			} catch (e) {
				// nothing...
			}

			// set the cell onclick event handler.
			cell.onclick=itemAction;
		}

	},

	// transforms a string based on the provided map
	transform: function (str, map) {
		var tStr, tmp;
		tStr = str;
		for (p in map) {
			tmp = "[" + p + "]";
			while (tStr.indexOf(tmp) > -1) {
				tStr = tStr.replace(tmp, map[p]);
			}
		}
		return tStr;
	},

	// returns the menu's attributes collection that will be used to construct 
	// the transformation map
	getMenuAttributeArray: function (menu) {
		for (var i=0; i<menu.length; i++) {
			if (menu[i].type == this.TYPE_ATTRIBUTES) {
				return menu[i]["attributes"].split(',');
			}
		}
		return new Array(0);
	},

	// construct the transformation map for a given object based on the tags in 
	// attribs
	buildAttributeMap: function (attribs, obj) {
		var thisAttr, thisValue;
		var attrMap = new Object();

		for (var a=0; a<attribs.length; a++) {
			thisAttr = attribs[a];
			thisValue = obj.getAttribute(attribs[a]);
			if (typeof thisValue != "undefined") {
				attrMap[thisAttr] = thisValue;
			}
		}
		return attrMap;
	},

	// find the position of an element on the screen and returns an array of [x,y]
	findPosition: function (obj) {
		var lft = 0;
		var top = 0;
		if (obj.offsetParent) {
			lft = obj.offsetLeft
			top = obj.offsetTop
			while (obj = obj.offsetParent) {
				lft += obj.offsetLeft
				top += obj.offsetTop
			}
		}
		return {x:lft,y:top};
	},
	
	getWindowHeight: function() {
		if (this.browser.khtml || this.browser.safari) {
			return this.innerHeight;
		} else if (this.browser.opera) {
			return document.body.clientHeight;			
		} else {
			return document.documentElement.clientHeight;
		}
	},

	// Returns the dimensions of an element on screen. Lifted from the wonderful 
	// prototype framework
	getDimensions: function(obj) {
		//var display = obj.getStyle('display');
		//if (display != 'none' && display != null) // Safari bug
		//  return {width: element.offsetWidth, height: element.offsetHeight};

		// All *Width and *Height properties give 0 on elements with display none,
		// so enable the element temporarily
		var objStyle = obj.style;
		var originalVisibility = objStyle.visibility;
		var originalPosition = objStyle.position;
		var originalDisplay = objStyle.display;
		objStyle.visibility = 'hidden';
		objStyle.position = 'absolute';
		objStyle.display = 'block';
		var originalWidth = obj.clientWidth;
		var originalHeight = obj.clientHeight;
		objStyle.display = originalDisplay;
		objStyle.position = originalPosition;
		objStyle.visibility = originalVisibility;
		return {width: originalWidth, height: originalHeight};
	},

	// positions object at x,y coordinates
	// v0.2 - added px to the position coordinate (provided by JDG)
	position: function (obj, x, y) {
		obj.style.left = x + 'px';
		obj.style.top  = y + 'px';
	},

	// builds a menu for parent object
	buildMenu: function (parent) {
		var pos, dim, tbl;
		//document.onmousemove  = RightContext.getMousePos;
		this.contextMenu = document.createElement("DIV");
		this.contextMenu.id = "rcRightContext";
		this.contextMenu.className = 'rcMenuContainer';

		// get the position and dimensions of the parent
		pos = this.findPosition(parent);
		dim = this.getDimensions(parent);

		// position the container to the bottom right of the element.
		this.position (this.contextMenu, this.mousePos.x + this.rightOffset, pos.y+dim.height);

		// set some event handlers
		// if the menu is triggered by a right click, disable the right click on the menu itself
		if (this.menuTriggerEvent == "RIGHT") {
			this.contextMenu.oncontextmenu = function () { return false; };
		}
		
		// add the container to the body of the document
		document.body.appendChild(this.contextMenu);
		
	},


	// kills the currently visible context menu
	killMenu: function () {
		if (!this.abortKill && this.isShowing) {
		try {
			rc = this.contextMenu;
			document.body.removeChild(rc);
		} catch (e) {
			// already removed?
		}
		this.contextMenu = null;
		this.isShowing = false;
		this.abortKill = false;
		}
	},

	// locate the mouse cursor position 
	locateMousePos: function(e) {
		var posx = 0, posy =0;
		if(e==null) e=window.event;
		if(e.pageX || e.pageY) {
			posx=e.pageX; posy=e.pageY;
		} else if (e.clientX || e.clientY) {
			if(document.documentElement.scrollTop){
				posx=e.clientX+document.documentElement.scrollLeft;
				posy=e.clientY+document.documentElement.scrollTop;
			} else {
				posx=e.clientX+document.body.scrollLeft;
				posy=e.clientY+document.body.scrollTop;
			}
		}
		this.mousePos = {x:posx , y:posy};

	},
	
	// redirects the browser to given url
	// if frame!=false, it will open in provided frame (or new win if _blank)
	redirect: function (u, frame) {
		if (!frame) {
			document.location = u;  
		} else {
			if (frame=="_blank") {
				w = window.open(u, 'w');
			} else {
				window.frames[frame].document.location = u;
			}
		}
	},
	
	// performs a request - ajax style
	request: function (url, callBack) {
		if (window.XMLHttpRequest) { // native XMLHttpRequest
			this.req = new XMLHttpRequest();
			this.req.onreadystatechange =  callBack; 
			this.req.open("GET", url, true);
			this.req.send(null);
		} else if (window.ActiveXObject) { // The M$ 'standard'
			this.req = new ActiveXObject("Microsoft.XMLHTTP");
			if (this.req) { 
				this.req.onreadystatechange =   callBack;
				this.req.open("GET", url, true);
				this.req.send();
			}
		}
	},
	
	loadImage: function (url) {
		var img = new Image();
		img.src = url; 
		img.className = "rcImage";
		this.images[url] = img;
		return img;
	},
	
	detectBrowser: function() {
		var ua = navigator.userAgent.toUpperCase();
		var up = navigator.platform.toUpperCase().substr(0,3);
		var isSafari  = (ua.indexOf("SAFARI"   )>0);
		var isKHTML   = (ua.indexOf("KONQUEROR")>0 || isSafari);
		var isFirefox = (ua.indexOf("FIREFOX"  )>0); 
		var isOpera   = (ua.indexOf("OPERA"    )>=0);
		return { safari: isSafari, khtml: isKHTML, opera: isOpera, firefox: isFirefox, platform: up }
	}

};