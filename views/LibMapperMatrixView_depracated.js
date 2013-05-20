/**
 * The View. View presents the model and provides
 * the UI events. The controller is attached to these
 * events to handle the user interaction.
 */

function LibMapperMatrixView_depracated(container, model)
{
	
		
}

LibMapperMatrixView_depracated.prototype = {
		
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
//		  	   View's Cell Class		  	  //		 
//+++++++++++++++++++++++++++++++++++++++++++ //

function MatrixViewCell(row, col, src, dst)
{
	this.id = this.nextCellId();
	this.row = row;
	this.col = col;
	this.src = src;
	this.dst = dst;
	this.classname = "";
};

//+++++++++++++++++++++++++++++++++++++++++++ //
//		  View's Source Signal Class		  //		 
//+++++++++++++++++++++++++++++++++++++++++++ //

function MatrixViewSourceSignal(signal)
{
	this.id = signal.id;	// reference to the signal object		
	this.col = 0;
};

//+++++++++++++++++++++++++++++++++++++++++++ //
//		View's Destination  Signal Class	  //		 
//+++++++++++++++++++++++++++++++++++++++++++ //

function MatrixViewDestinationSignal(signal)
{
	this.id = signal.id;	// reference to the signal object	
	this.row = 0;
};
