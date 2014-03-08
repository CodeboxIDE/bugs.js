



mnuRegs = { attributes: "regName,regValue",
		items: [ {type:RightContext.TYPE_MENU,
				  text: "modify [regName]",
				  onclick: function() {
					  var newValue = prompt('[regName]','[regValue]');
					  gdb.cmd('set $[regName] = '+newValue, ev.syncAll);
				  	}},
				  
				  {type:RightContext.TYPE_MENU,
					  text: "breakpoint [regValue]",
					  onclick: function() {
						  gdb.cmd('b *[regValue]', ev.syncAll);
					  }},
					 
				  {type:RightContext.TYPE_MENU,
						  text: "Follow in memory [regValue]",
						  onclick: function() {
							  document.getElementById('memAddr').value='[regValue]';
							  ev.syncMem();
						  }},
						  
				  {type:RightContext.TYPE_MENU,
					  text: "Follow in asm [regValue]",
					  onclick: function() {
						  ev.syncAsm('[regValue]');
					  }},	  
		]
};


mnuMem = { attributes: "memAddr",
		items: [ 
				  
				  {type:RightContext.TYPE_MENU,
					  text: "Breakpoint [memAddr]",
					  onclick: function() {
						  gdb.cmd('b *[memAddr]', ev.syncAll);
					  }},
					 
				  {type:RightContext.TYPE_MENU,
						  text: "Follow in memory [memAddr]",
						  onclick: function() {
							  document.getElementById('memAddr').value='[memAddr]';
							  ev.syncMem();
						  }},
						  
				  {type:RightContext.TYPE_MENU,
					  text: "Follow in asm [memAddr]",
					  onclick: function() {
						  ev.syncAsm('[memAddr]');
					  }},	  
		]
};


mnuBP = {
		attributes: "bpId,bpAddr",
		items: [
		        {type:RightContext.TYPE_MENU,
					  text: "Delete bp [bpAddr]",
					  onclick: function() {
						  gdb.cmd('delete [bpId]', ev.syncAll);
					  }},
					  					  
				  {type:RightContext.TYPE_MENU,
					  text: "Follow in memory [bpAddr]",
					  onclick: function() {
						  document.getElementById('memAddr').value='[bpAddr]';
						  ev.syncMem();
					  }},
						  
				  {type:RightContext.TYPE_MENU,
					  text: "Follow in asm [bpAddr]",
					  onclick: function() {
						  ev.syncAsm('[bpAddr]');
					  }},	
	    ]
};    

mnuStack = {
		attributes: "stackAddr",
		items: [
		       
				  {type:RightContext.TYPE_MENU,
					  text: "Breakpoint [stackAddr]",
					  onclick: function() {
						  gdb.cmd('b *[stackAddr]', ev.syncAll);
					  }},
			  
				  {type:RightContext.TYPE_MENU,
					  text: "Follow in memory [stackAddr]",
					  onclick: function() {
						  document.getElementById('memAddr').value='[stackAddr]';
						  ev.syncMem();
					  }},
						  
				  {type:RightContext.TYPE_MENU,
					  text: "Follow in asm [stackAddr]",
					  onclick: function() {
						  ev.syncAsm('[stackAddr]');
					  }},	
	    ]
};  

mnuAsm =  {
	attributes: "asmAddr",
	items: [
	        
			  {type:RightContext.TYPE_MENU,
				  text: "Breakpoint [asmAddr]",
				  onclick: function() {
					  gdb.cmd('b *[asmAddr]', ev.syncAll);
				  }},
		  
			  {type:RightContext.TYPE_MENU,
				  text: "Follow in memory [asmAddr]",
				  onclick: function() {
					  document.getElementById('memAddr').value='[asmAddr]';
					  ev.syncMem();
				  }},
					    
	        
    ]
};


