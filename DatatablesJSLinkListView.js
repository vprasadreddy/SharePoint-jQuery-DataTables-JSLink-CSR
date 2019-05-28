<style>
/* this style is used to shrink the long text */
.display td {
	max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.dataTables_filter {
   float: left !important;
}
</style>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css">
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/1.2.2/css/buttons.dataTables.min.css">
<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/buttons/1.5.2/js/dataTables.buttons.min.js"></script>
<script src="https://cdn.datatables.net/buttons/1.5.2/js/buttons.flash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/pdfmake.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/vfs_fonts.js"></script>
<script src="https://cdn.datatables.net/buttons/1.5.2/js/buttons.html5.min.js"></script>
<script src="https://cdn.datatables.net/buttons/1.5.2/js/buttons.print.min.js"></script>
 
<script type="text/javascript">
/* 
** References Used **
https://yuriburger.net/2015/02/17/jslink-and-datatables/
https://prasadpathak.wordpress.com/tag/onpostrender/
https://n8d.at/blog/handling-field-values-in-jslink/
https://www.c-sharpcorner.com/article/modify-sharepoint-list-view-using-client-side-rendering-and-jslink/
https://www.dynamics101.com/jslink-sharepoint-2013-get-started/
https://code.msdn.microsoft.com/office/Client-side-rendering-JS-2ed3538a
https://docs.microsoft.com/en-us/sharepoint/dev/spfx/extensions/guidance/migrate-from-jslink-to-spfx-extensions
https://social.technet.microsoft.com/wiki/contents/articles/37684.sharepoint-2013-jslink-client-side-rendering.aspx
https://christopherclementen.wordpress.com/2017/08/07/1131/ for rendering different values.

** Reference for SP.UI.ModalDialog.RefreshPage(dialogResult) & SP.UI.ModalDialog.showModalDialog(options) functions **
https://www.codeproject.com/Articles/1110186/Integrate-Bootstrap-framework-in-SharePoint
https://docs.microsoft.com/en-us/previous-versions/office/developer/sharepoint-2010/ff411790(v%3Doffice.14)
https://sharepoint.stackexchange.com/questions/202829/how-to-refresh-page-after-closing-dialog-form-sharepoint-2013/202832
http://owenrunnals.blogspot.com/2013/02/sharepoint-modaldialog-and-refreshing.html
https://www.c-sharpcorner.com/blogs/how-to-open-sharepoint-application-page-in-modal-dialog-popup-using-javascript
http://bvs-sharepoint.blogspot.com/2017/04/close-sharepoint-dialog-box-and-refresh.html

** Reference for JSLink/CSR in SharePoint Document Library **
https://code.msdn.microsoft.com/office/Client-side-rendering-code-97e27fa1

** Reference for SharePoint footer pagination **
http://www.casvaniersel.com/2013/02/jslink-with-paging-for-rendering-list-views/
https://gist.github.com/ecapandegui/b875c715113c3c22c17aacb35169a548
https://wpintegrate.com/how-to-implement-custom-pagination-using-jslink/
http://www.benprins.net/2017/07/10/sharepoint-jslink-paging/

** CSS Reference for text overflow in columns. **
https://ansta.co.uk/blog/gracious-overflow-of-text-in-data-tables-308/ 
*/  
 
 /* Function to Initialize and change the default SharePoint List View to jQuery Datatables view. */ 
(function () {
    var itemCtx = {};
    itemCtx.Templates = {};
    itemCtx.Templates.Header = "<table class='display' id='datatablesListView'>";
	itemCtx.Templates.Item = ItemOverrideDataTables; /* function to get Item column values */
	itemCtx.Templates.Footer = pagingControl; /* the closing </table> tag is in this function */
    itemCtx.ListTemplateType = 100; /* This Template ID is for SharePoint Lists(Custom Lists) only */
    itemCtx.OnPostRender = [];
 
    itemCtx.OnPostRender.push(function()
    {
        /* Dynamically creating the Datatable with Column Names as headers. */
		$(function(){  
		var columns = [];
        var index, len;
        for (index = 0, len = ctx.ListSchema.Field.length; index < len; ++index) {
            columns.push( {"title": ctx.ListSchema.Field[index].DisplayName });
        }
 
        $("#datatablesListView").dataTable(
        {
            dom: 'lBfrtip',
		/*  pageLength: 50,  Default Number of rows (items) to display on a single page when using pagination. */
		
		/*
        using excelHTML5, copyHtml5, csvHtml5, pdfHtml5 buttons for extend, so that data table works in IE (Internet Explorer). 
		Regular excel, copy, csv, pdf button's are not working in Internet Explorer, but they work in Chrome or Mozilla.
		*/

        buttons: [
			/* since excel button is not working in IE, hiding it on the screen.
			{
            extend: 'excelHtml5',
            title: 'Excel Export',
			text: '<i class="fa fa-file-excel-o" style="font-size:15px" aria-hidden="true"></i> Export to Excel'
            }, 
			*/
			{
            text: '<i class="fa fa-plus" style="font-size:15px"></i> Add New Item',
            action: function ( e, dt, node, config ) 
				{
					var newFormURL = ctx.newFormUrl + "&Source=" + ctx.ListSchema.PagePath;
					window.open(newFormURL);
				}
			},
            {
			extend:'copyHtml5',
			text: '<i class="fa fa-clipboard" style="font-size:15px" aria-hidden="true"></i> Copy'
			},

			{
            extend:'csvHtml5',
			title: 'CSV Export',
			text: '<i class="fa fa-file-excel-o" style="font-size:15px" aria-hidden="true"></i> Export to CSV'
			},
			
			{
            extend:'pdfHtml5',
			title: 'PDF Export',
			orientation: 'landscape',	//landscape give you more space
            pageSize: 'A4',				//A0 is the largest A5 smallest(A0,A1,A2,A3,legal,A4,A5,letter))
			text: '<i class="fa fa-file-pdf-o" style="font-size:15px" aria-hidden="true"></i> Export to PDF'
			}
        ],
			"columns": columns
        });
		});
    });
 
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(itemCtx);
})();
/* End of Initialize function */ 

/* Below function is used to get Column values */
/* Start of ItemOverrideDataTables function  */
function ItemOverrideDataTables(ctx) {
    var rowItem = "<tr>";
 
    var index, len;
    for (index = 0, len = ctx.ListSchema.Field.length; index < len; ++index) {
        var cell = "";
         
        /* Test for LookUP */
		/* To check if the Column is of type LookUP */
		if (ctx.ListSchema.Field[index].FieldType === "Lookup") 
		{
				if (Object.prototype.toString.call(ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName]) === '[object Array]')
				{
				for (index1 = 0, len1 = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length; index1 < len1; ++index1) 
				{
                cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][index1].lookupValue;
				}
				}
			else
			{
				cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName];	
			}
        }
			
	    else if (ctx.ListSchema.Field[index].FieldType === "LookupMulti") 
		{
				if(ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length==0)
				{
					cell += "";
				}
				else if(ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length==1)
				{
					for (index1 = 0, len1 = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length; index1 < len1; ++index1) {
                    cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][index1].lookupValue;
			    }
				}
				else
				{
					for (index1 = 0, len1 = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length; index1 < len1; ++index1) {
                    cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][index1].lookupValue + ";" + " ";
			    }
				}					
				
        }
		/* End of LookUP column */
		
				/* To check if the Column is of type Boost LookUP */
		else if (ctx.ListSchema.Field[index].FieldType === "Brandysoft.SharePoint.LookupPro.CascadedLookup")
		{
				for (index1 = 0, len1 = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length; index1 < len1; ++index1) 
				{
                    cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][index1].lookupValue + ";" + " ";
				}
		}
		/* End of Boost LookUP */
			
		/* check for Edit option */
		else if (ctx.ListSchema.Field[index].Name === "Edit") 
		{
			
			/* to open EditForm Link in SP Dialog box
			**change ctx.editFormUrl to your URL variable or actual "URL value" enclosed in double quotes.
			"<a href=javascript:ModalDailog('" + ctx.editFormUrl + "&amp;ID=" + ctx.CurrentItem.ID +  "&Source=" + ctx.ListSchema.PagePath + "')>"; 		
			
			**or use below notation to open EditForm in the same window.
			change ctx.editFormUrl to your URL variable or actual "URL value" enclosed in double quotes.
			"<a href='" + ctx.editFormUrl + "&amp;ID=" + ctx.CurrentItem.ID +  "&Source=" + ctx.ListSchema.PagePath + "'>";
			
			** To open EditForm in a new tab.
			change ctx.editFormUrl to your URL variable or actual "URL value" enclosed in double quotes.
			"<a href='" + ctx.displayFormUrl + "&amp;ID=" + ctx.CurrentItem.ID + "&Source=" + ctx.ListSchema.PagePath + "' target="+ '_blank' +">";
			*/
            cell = "<a href='" + ctx.editFormUrl + "&amp;ID=" + ctx.CurrentItem.ID +  "&Source=" + ctx.ListSchema.PagePath + "'>";
            cell += "<i class='fa fa-edit' style='font-size:15px' aria-hidden='true'></i> Edit Item";
            cell += "</a>";
        }
		/* end of Edit option */
		
		/* check for document type */
        else if (ctx.ListSchema.Field[index].Name === "DocIcon") 
		{
			/* 
			if ctx.CurrentItem["FSObjType"]==="1" its either Folder or Document Set
			if ctx.CurrentItem["FSObjType"]==="0" its of the type document
			*/
			if (ctx.CurrentItem["FSObjType"]==="1" && ctx.CurrentItem["HTML_x0020_File_x0020_Type"]==="Sharepoint.DocumentSet")
			{
			 var title = ctx.CurrentItem["FileLeafRef"];
			 var fileTypeIcon = ctx.CurrentItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"];
			 var iconSrc = ctx.imagesPath + fileTypeIcon;
			 cell += "<img title='" + title + "' alt='" + title + "' src='" + iconSrc +"' />" + " - " + "DOCUMENT SET";
			}
			
			else if (ctx.CurrentItem["FSObjType"]==="1" && ctx.CurrentItem["HTML_x0020_File_x0020_Type"]==="")
			{
			 var title = ctx.CurrentItem["FileLeafRef"];
			 var iconSrc = ctx.imagesPath + "folder.gif";
			 cell += "<img title='" + title + "' alt='" + title + "' src='" + iconSrc +"' />" + " - " + "FOLDER";
			}
			
			else{
			 var title = ctx.CurrentItem["FileLeafRef"];
			 var fileTypeIcon = ctx.CurrentItem["HTML_x0020_File_x0020_Type.File_x0020_Type.mapico"];
			 var iconSrc = ctx.imagesPath + fileTypeIcon;
			 cell += "<img title='" + title + "' alt='" + title + "' src='" + iconSrc +"' />" + " - " + ctx.CurrentItem["File_x0020_Type"].toUpperCase();
			}

        }
		/* end of document type */
		
		/* check for item Link */
        else if (ctx.ListSchema.Field[index].Name === "LinkTitle") 
		{
			
			/* to open DispForm Link form in SP Dialog box
			**change ctx.displayFormUrl to your URL variable or actual "URL value" enclosed in double quotes.
			"<a href=javascript:ModalDailog('" + ctx.editFormUrl + "&amp;ID=" + ctx.CurrentItem.ID +  "&Source=" + ctx.ListSchema.PagePath + "')>"; 		
			
			**or use below notation to open DispForm in the same window.
			change ctx.displayFormUrl to your URL variable or actual "URL value" enclosed in double quotes.
			"<a href='" + ctx.editFormUrl + "&amp;ID=" + ctx.CurrentItem.ID +  "&Source=" + ctx.ListSchema.PagePath + "'>";
			
			** To open DispForm in a new tab.
			change ctx.displayFormUrl to your URL variable or actual "URL value" enclosed in double quotes.
			"<a href='" + ctx.displayFormUrl + "&amp;ID=" + ctx.CurrentItem.ID + "&Source=" + ctx.ListSchema.PagePath + "' target="+ '_blank' +">";
			*/
            cell = "<a href=javascript:ModalDailog('" + ctx.displayFormUrl + "&amp;ID=" + ctx.CurrentItem.ID +  "&Source=" + ctx.ListSchema.PagePath + "')>";
            cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName];
            cell += "</a>";
        }
		/* end of item Link */
		
		/* check for HyperLink field
		** to open hyperlinks/URLs in same tab.
		"<a href='" + ctx.displayFormUrl + "&amp;ID=" + ctx.CurrentItem.ID + "'>";
		
		** to open hyperlinks/URLs in a new tab.
		"<a href='" + ctx.displayFormUrl + "&amp;ID=" + ctx.CurrentItem.ID + "' target="+ '_blank' +">";
		*/
        else if (ctx.ListSchema.Field[index].FieldType === "URL") 
		{
            cell = "<a href='" + ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName] + "' target="+ '_blank' +">";
            cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName + ".desc"];
            cell += "</a>";
        }
		/* end of check for HyperLink field */
		
		/* to check if the column is of Metadata(taxonomy) type field (single value). */
		else if (ctx.ListSchema.Field[index].FieldType === "TaxonomyFieldType") 
		{
				if (ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].Label=== undefined) /* checking if the Metadata field value is null or undefined */
				cell += "";
				else
				{
				cell = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].Label;
				}
		}	
		/* end of to Metadata(taxonomy) type field (single value). */
		
		/* to check if the column is of Metadata(taxonomy) type field (Multiple values). */
		else if (ctx.ListSchema.Field[index].FieldType === "TaxonomyFieldTypeMulti") 
		{
				if (ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length==0)
				{
					cell += "";
				}
				else if(ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length==1)
				{
					for (index1 = 0, len1 = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length; index1 < len1; ++index1) {
                    cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][index1].Label;
			    }
				}
				else
				{
					for (index1 = 0, len1 = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length; index1 < len1; ++index1) {
                    cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][index1].Label + ";" + " ";
			    }
			}
		}
		/* end of to Metadata(taxonomy) type field (Multiple values). */
		
		/* Test for Choice column */
        else if (ctx.ListSchema.Field[index].FieldType === "Choice") 
		{
			cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName];  
        }
		/* end of Test for Choice column */	
		
		
		/* Test for Choice column with multiple values */
        else if (ctx.ListSchema.Field[index].FieldType === "MultiChoice") 
		{
			if (Object.prototype.toString.call(ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName]) === '[object Array]') /* condition to check if the Choice column has multiple values*/
			{
				if (ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length == 1)
				{
					cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][0];
				}
				
				else
				{
					for (index1 = 0, len1 = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length; index1 < len1; ++index1)
					{
						cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][index1] + ";" + " ";
					}
				}		
			}
			else
			{
				cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName];
			}
           
        }
		/* end of Test for Choice column with multiple values */	
		
		/* Test for People Picker column with single value */	
		else if (ctx.ListSchema.Field[index].FieldType === "User") 
		{
			if (Object.prototype.toString.call(ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName]) === '[object Array]') /* condition to check if the people picker has only one value*/
			{
				cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][0].title + " ";
			}
			else
			{
				cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName];
			}
		}
		/* END of Test for People Picker column with single value */	
		
		/* Test for People Picker column with multiple values */	
		else if (ctx.ListSchema.Field[index].FieldType === "UserMulti") 
		{
			if (Object.prototype.toString.call(ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName]) === '[object Array]')
			{
				if (ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length == 1) /* condition to check if the people picker has only one value*/
				{
					cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][0].title;
				}
				
				else /* if people picker has multiple values */
				{
					for (index1 = 0, len1 = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length; index1 < len1; ++index1) 
					{
						cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][index1].title + ";" + " ";
					}
				}
			}
			
			else
			{
				cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName];
			}	
		}
		/* END of Test for People Picker column with multiple values */	
		
		
		
		/* Test for an Array */
        else if (Object.prototype.toString.call(ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName]) === '[object Array]') 
		{
			if (ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length == 1) /* condition to check if the people picker has only one value*/
			{
				for (index1 = 0, len1 = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length; index1 < len1; ++index1) {
                cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][index1].title + " ";
            }
			}
			/* Test for an Array with multiple values */
			else{  
				for (index1 = 0, len1 = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName].length; index1 < len1; ++index1) {
                cell += ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName][index1].title + ";" + " ";
            }
			}
           
        }
		/* end of Test for an Array */	
		
		
		/* code for other column types like Single line of text etc */
        else 
		{
            cell = ctx.CurrentItem[ctx.ListSchema.Field[index].RealFieldName];
        }
		/* END of code for other column types like Single line of text etc */
        rowItem += "<td>" + cell + "</td>" ;
    }
 
    rowItem += "</tr>";
 
    return rowItem;
}
/* End of ItemOverrideDataTables function  */

/* Start of footer pagination function  */
function pagingControl(ctx)
	{
        var firstRow = ctx.ListData.FirstRow != undefined ? ctx.ListData.FirstRow : "";
        var lastRow = ctx.ListData.LastRow != undefined ? ctx.ListData.LastRow : "";
        var prev = ctx.ListData.PrevHref;
        var next = ctx.ListData.NextHref;
        var html = "</table>" + "<div class='Paging'>";
        html += prev ? "<a class='ms-commandLink ms-promlink-button ms-promlink-button-enabled' href='" + prev + "'><span class='ms-promlink-button-image'><img class='ms-promlink-button-left' src='/_layouts/15/images/spcommon.png?rev=23' /></span></a>" : "";
        html += "<span class='ms-paging'><span class='First'>" + firstRow + "</span> - <span class='Last'>" + lastRow + "</span></span>";
        html += next ? "<a class='ms-commandLink ms-promlink-button ms-promlink-button-enabled' href='" + next + "'><span class='ms-promlink-button-image'><img class='ms-promlink-button-right' src='/_layouts/15/images/spcommon.png?rev=23'/></span></a>" : "";
        html += "</div>";
        return html;
}
/* End of footer pagination function  */

 /* Below Function is used to open URL or hyperlinks in SharePoint Modal Dailog box. */
 /* Start of ModalDailog function */ 
 function ModalDailog(urlvalue)
 {    
     var options = {
         url: urlvalue,            
         allowMaximize: true,
         showClose: true,     
         dialogReturnValueCallback: silentCallback
     };
     SP.UI.ModalDialog.showModalDialog(options);
 }
/* End of ModalDailog function */ 
 
/* This function is used to refresh the page after an Item is created successfully. */
 function silentCallback(dialogResult)
 {
	if (dialogResult != SP.UI.DialogResult.cancel)
		{
        SP.UI.ModalDialog.RefreshPage(dialogResult);
		}
 }
/* END of function to refresh the page after an Item is created successfully. */
</script>
