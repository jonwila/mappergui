/**
 * The View. View presents the model and provides
 * the UI events. The controller is attached to these
 * events to handle the user interaction.
 */

function LibMapperMatrixView(container, model)
{
	
		
}

LibMapperMatrixView.prototype = {
		
	
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
