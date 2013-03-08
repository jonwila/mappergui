//connection constructor
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

//signal constructor 
function Signal(name)
{
	this.name=name;
};

// My helper functions //
function toViewBoxString(vboxX, vboxY, vboxW, vboxH)
{
	return vboxX.toString() + " " + vboxY.toString() + " " + vboxW.toString() + " " + vboxH.toString()
}

function makeId(row, col)
{
	return row.toString() + "," + col.toString();
};

function getRowIndex(cellId)
{
	var index = cellId.split(",");
	return parseInt(index[0]);
};

function getColIndex(cellId)
{
	var index = cellId.split(",");
	return parseInt(index[1]);
};

function getCellIndex(cellId)
{
	var index = cellId.split(",");
	var result = new Array();
	result.push(parseInt(index[0]));
	result.push(parseInt(index[1]));
	return result;
}


function removeCellClass(needle, cell)
{
	var classes_ar = cell.getAttribute("class").split(" ");
	var result = "";
	var nClasses = 0;
	
	for(var i=0; i<classes_ar.length; i++)
	{
		if(classes_ar[i] != needle)
		{
			if(nClasses == 0)
				result += classes_ar[i];
			else
				result += " " + classes_ar[i];
			nClasses++;	
		}
	}	
	cell.setAttribute("class", result);
}

function addCellClass(needle, cell)
{
	var haystack = cell.getAttribute("class").toString();
	if(haystack.indexOf(needle) == -1)
		haystack += (" " + needle);
	cell.setAttribute("class", haystack);
}



