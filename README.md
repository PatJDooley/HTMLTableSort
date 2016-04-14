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

Tablesort recognizes multiple data formats and sorts accordingly.

If a column only contains numeric fields, the sort will be numeric.

If a column contains a recognized date format, the sort will be based on that date. Tablesort recognizes mm/dd/yy[yy], dd/mm/yyy[yy] and yy[yy]/mm/dd. Invalid dates, such as "2/29/2009" [mm/dd/yy[yy] format], will not throw an exception. 

Invalid dates, such as "2/32/2009" [mm/dd/yy[yy] format], will not throw an exception but they will cause the column to be treated as a text column.

We assume the server validates dates.

Restore original order.

"tablesort" remembers the original order of the table. You can restore the original order by omitting a column name.

        $('#sample').sortByColumn();

Sort explicitly.

If you want to sort a table based on some other event, all you have to do is specify the text of the column header.

        $('#sample').sortByColumn('Part Number');

