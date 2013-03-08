/**
 * The Model. Model stores items and notifies
 * observers about changes.
 */

function LibMapperModel (){
	
	this.cols = new Array(); 		// to hold source signals
	this.rows = new Array(); 		// to hold destination signals
	this.connections = new Array();	// to hold connections
};

LibMapperModel.prototype = {
		
		addSourceSignal : function(signal){
			this.cols.push(signal.name.toString());	//CHANGE to use object
		},
		
		addDestinationSignal : function(signal){
			this.rows.push(signal.name.toString());	//CHANGE to use object
		},
		
		createConnection : function(row, col){
			var con = new Connection(row,col);
			con.src = this.cols[col];
			con.dest = this.rows[row];
			this.connections.push(con);
		},
		
		removeConnection : function(cellId){
			this.connections.splice(this.getConnectionIndex(cellId), 1);
		},
		
		isConnected : function (cellId){
			if(this.getConnectionIndex(cellId) == -1)
				return false;
			else
				return true;
		},
		
		getConnectionIndex : function(cellId){
			var i;						// to hold index to point into connections array
			// loop through connections array to see if the cell already has a connection 
			for(i=0; i<this.connections.length; i++){
				if(this.connections[i].id == "connection" + cellId){
					break;
				}
			}
			return (i<this.connections.length)? i : -1;
		},
		
		getConnection : function(cellId){
			var ind = this.getConnectionIndex(cellId);
			return this.connections[ind];
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





// Connection constructor
function Connection(row, col)
{	
	this.id = "connection" + row + "," + col;
	this.src = "";
	this.dest = "";
	this.mute = 0;
	this.mode = "";
	this.range = [1,1,0,1];
	this.expression = "";
	this.clipMin = "";
	this.clipMax = ""; 
};

// Signal constructor 
function Signal(name)
{
	this.name=name;
};