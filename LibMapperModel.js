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
		
		addSignal : function(args){
			var sig = new Signal(args);
			this.signals.push(sign);
			return sig;
		},
		
		new_device : function(args){
			var dev = new Device(args);
			this.devices.push(args);
			return dev;
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
		}
		
		/*
		
		createConnection : function(src, dst){
			var con = new Connection(src,dst);
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
				if(con.src == src && con.dst == dst){
					break;
				}
			}
			return (i<this.connections.length)? i : -1;
		},
		
		getConnection : function(index){
			return this.connections[index];
		},
		
		//Should not be using indices for connections in the model.. move to the view
		//In the model it should hold, rather hold a reference to source and destination
		incConnectionColIndicesAfter : function(index){
			for(var i=0; i<this.connections.length; i++)
			{
				var connection = this.connections[i];
				var conCol = getColIndex(connection.id.substr(("connection").length));
				var conRow = getRowIndex(connection.id.substr(("connection").length));
				if (conCol >= index){
					conCol++;
					connection.id = "connection" + conRow + "," + conCol;
				}
			}
		},
		incConnectionRowIndicesAfter : function(index){
			for(var i=0; i<this.connections.length; i++)
			{
				var connection = this.connections[i];
				var conCol = getColIndex(connection.id.substr(("connection").length));
				var conRow = getRowIndex(connection.id.substr(("connection").length));
				if (conRow >= index){
					conRow++;
					connection.id = "connection" + conRow + "," + conCol;
				}
			}
		}*/
		
};





//+++++++++++++++++++++++++++++++++++++++++++ //
//				Connection Class			  //		 
//+++++++++++++++++++++++++++++++++++++++++++ //

function Connection(src, dst)
{	
	//this.id = "connection" + row + "," + col;
	this.src = src;
	this.dst = dst;
	this.mute = 0;
	this.mode = "";
	this.range = [1,1,0,1];
	this.expression = "";
	this.clipMin = "";
	this.clipMax = ""; 
};

// +++++++++++++++++++++++++++++++++++++++++++ //
//			  Source Signal Class			   //		 
// +++++++++++++++++++++++++++++++++++++++++++ //

function SourceSignal(name)
{
	this.id = SourceSignal.idCounter++;
	this.name=name;
	// direction, length, min, max, 
	// strings: type, units
	// metadata
};
SourceSignal.idCounter = 0;


// +++++++++++++++++++++++++++++++++++++++++++ //
//			Destination Signal Class		   //		 
// +++++++++++++++++++++++++++++++++++++++++++ //

function DestinationSignal(name)
{
	this.id = DestinationSignal.idCounter++;
	this.name=name;
	//strings: host, 
	// port, connections in, connections out, inputs, outputs, links in, links out
	
};
DestinationSignal.idCounter = 0;








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
	var device_name = args.device_name;
	var direction = args.direction;
	var length = args.length;
	var max = args.max;
	var min = args.min;
	var name = args.name;
	var rate = args.rate;
	var type = args.type;
	var unit = args.unit;
}
