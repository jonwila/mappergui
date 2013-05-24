//+++++++++++++++++++++++++++++++++++++++++++ //
//				LibMapper Model				  //		 
//+++++++++++++++++++++++++++++++++++++++++++ //


function LibMapperModel ()
{
	this.devices = new Array();
	this.signals = new Array();
	this.links = new Array();
	this.connections = new Array();
};

LibMapperModel.prototype = {
		
		new_device : function(args){
			var dev = new Device(args);
			this.devices.push(dev);
			return dev;
		},
		
		new_signal : function(args){
			var sig = new Signal(args);
			this.signals.push(sig);
			return sig;
		},
		
		getSignal : function(name){
			for(var i=0; i<this.signals.length; i++)
				if(this.signals[i].name == name)
					return this.signals[i];
			return false;	
		},
		
		getDevice : function(name){
			for(var i=0; i<this.devices.length; i++)
				if(this.devices[i].name == name)
					return this.devices[i];
			return false;	
		},
		
		
		// CONNECTIONS
		
		createConnection : function(src, dst){
			var args = new Array();
			args['src_name'] = src;
			args['dest_name'] = dst;
			var con = new Connection(args);
			this.connections.push(con);
		},
		
		removeConnection : function(index){
			this.connections.splice(index, 1);
		},
		
		isConnected : function (src, dst)
		{
			if(this.getConnectionIndex(src, dst) == -1)
				return false;
			else
				return true;
		},
		
		getConnectionIndex : function(src, dst){
			
			if(this.connections.length == 0)
				return -1;
			
			// loop through connections array to see if the cell already has a connection 
			var i;						// to hold index to point into connections array
			for(i=0; i<this.connections.length; i++)
			{
				var con = this.connections[i];
				if(con.src_name == src && con.dest_name == dst){
					break;
				}
			}
			return (i<this.connections.length)? i : -1;
		},
		
		getConnection : function(index){
			return this.connections[index];
		},
		
		// LINKS
		
		createLink : function(src, dst){
			var args = new Array();
			args['src_name'] = src;
			args['dest_name'] = dst;
			var link = new Link(args);
			this.links.push(link);
		},
		
		removeLink : function(index){
			this.links.splice(index, 1);
		},
		
		isLinked : function (src, dst)
		{
			if(this.getLinkIndex(src, dst) == -1)
				return false;
			else
				return true;
		},
		
		getLinkIndex : function(src, dst){
			
			if(this.links.length == 0)
				return -1;

			// loop through links array to see if the cell already has a connection 
			var i;						// to hold index to point into links array
			for(i=0; i<this.links.length; i++)
			{
				var con = this.links[i];
				if(con.src_name == src && con.dest_name == dst){
					break;
				}
			}
			return (i<this.links.length)? i : -1;
		},
		
		getLink : function(index){
			return this.links[index];
		}
		
		

		
};





//+++++++++++++++++++++++++++++++++++++++++++ //
//				Connection Class			  //		 
//+++++++++++++++++++++++++++++++++++++++++++ //
/*
function Connection(src, dst)
{	
	this.src = src;
	this.dst = dst;
	this.mute = 0;
	this.mode = "";
	this.range = [1,1,0,1];
	this.expression = "";
	this.clipMin = "";
	this.clipMax = ""; 
};
*/
//+++++++++++++++++++++++++++++++++++++++++++ //
//				Connection Class			  //		 
//+++++++++++++++++++++++++++++++++++++++++++ //

/*
function Link(src, dst)
{	
	this.src = src;
	this.dst = dst;
};
*/


/**
 * class for Devices
 * @param args
 */
function Device(args)
{	
	this.host = args['host'];
	this.n_connections_in = args['n_connections_in'];
	this.n_connections_out = args['n_connections_out'];
	this.n_inputs = args['n_inputs'];
	this.n_links_in = args['n_links_in'];
	this.n_links_out = args['n_links_out'];
	this.n_outputs = args['n_outputs'];
	this.name = args['name'];
	this.port = args['port'];
	this.synced = args['synced'];
	this.version = args['version'];
};

/**
 * class for Signals
 * @param args
 */
function Signal(args)
{
	this.device_name = args['device_name'];
	this.direction = args['direction'];
	this.length = args['length'];
	this.max = args['max'];
	this.min = args['min'];
	this.name = args['name'];
	this.rate = args['rate'];
	this.type = args['type'];
	this.unit = args['unit'];
}


/**
 * class for Links
 * @param args
 */
function Link(args)
{
	this.src_name = args['src_name'];
	this.dest_name =  args['dest_name'];
};



/**
 * class for Connections
 * @param args
 */
function Connection(args)
{
	this.src_name = args['src_name'];
	this.dest_name =  args['dest_name'];
	/*
	bound_max: 0
	bound_min: 0
	dest_length: 1
	dest_type: "f"
	expression: "y=x*(0.1)+(-0)"
	mode: 2
	muted: 0
	range: Array[4]
	src_length: 1
	src_type: "f"
	*/
};

