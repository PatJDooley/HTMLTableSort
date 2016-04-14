# HTMLTableSort
Stuff I've coded that others might like

This is a jQuery plugin that makes an HTML table sortable by column. 

Include the javascript file or the min version.

      <script src="tablesort.js" type="text/javascript"></script>

or 

      <script src="tablesort.min.js" type="text/javascript"></script>

Assume the table has an 'id' of 'sample'.

Attach column sort to every header cell (note that you need to specify "th" or "td", depending on the table HTML).

         $('#sample th').mousedown(function (e) {
            $('#sample').sortByColumn($(this).text());
         });

When the user clicks a header cell, the table will be sorted on that column. The sort will be 'stable'. That means that the original sort order 
will be maintained within the sort. If the use clicks the same header cell again, without sorting on another column, the sort will be reversed.

Restore original order.

"tablesort" remembers the original order of the table. You can restore the original order by omitting a column name.

        $('#sample').sortByColumn();

Sort explicitly.

If you want to sort a table based on some other event, all you have to do is specify the text of the column header.

        $('#sample').sortByColumn('Part Number');

