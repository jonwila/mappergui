//+++++++++++++++++++++++++++++++++++++++++++ //
//				LibMapper Model				  //		 
//+++++++++++++++++++++++++++++++++++++++++++ //

function LibMapperModel (){
	
	this.cols = new Array(); 		// to hold source signals
	this.rows = new Array(); 		// to hold destination signals
	this.connections = new Array();	// to hold connections
};

LibMapperModel.prototype = {
		
		addSourceSignal : function(signal){
			this.cols.push(signal);	
		},
		
		addDestinationSignal : function(signal){
			this.rows.push(signal);	
		},
		
		getSourceSignal : function(name){
			var i;
			for(i=0; i<this.cols.length; i++){
				if(this.cols[i].name == name){
					return cols[i];
				}
			}
			return false;	
		},
		
		getDestinationSignal : function(name){
			var i;
			for(i=0; i<this.rows.length; i++){
				if(this.rows[i].name == name){
					return rows[i];
				}
			}
			return false;	
		},
		
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
		}
		
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






