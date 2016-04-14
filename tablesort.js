(function ($) {
   $.fn.sortByColumn = function (colhead) {      //
      // Sorts an HTML table on a column identified by the jQuery text() value of the first cell in the column
      //
      // Sort is stable.
      //
      // If the column header is not a string value, the sort will restore the original order.
      //
      // e.g.
      //    // Attach "SortbyColumn" to each column header of the table.
      //    // Header row can be in a "thead" with "th" cells or just in a "tr" with "td" cells.
      //
      //    $('.headerCell').click(function () {
      //       SortByColumn('#hoftable', $(this).text());
      //    });
      //
      //    $('#HeaderTable th').click(function () {
      //       SortByColumn('#HeaderTable', $(this).text());
      //    });
      //
      // First sort on a column is ascending; the second is descending.
      // This is reset if a different column is sorted in the interim.
      //
      // SortByColumn recognizes Date columns [mm/dd/yyyy only] and Numeric columms
      // and sorts accordingly.
      //
      // Columns must contain data of the same type in every row to be sorted
      // as Dates or Numbers.

      var tableData = new Array();
      var colX = -1;
      var rowX = -1;
      var sortCol = -1;
      var sortAsc = true;
      var firstRowSel = this.find('tr:first th').length > 0 ? ' tr:first th' : ' tr:first td';
      var rownum = 0;
      //
      // If first time, add orginal sequence number to each row for stable sorting
      this.find('tr').not(':first').each(function () {
         if ($(this).data('_seq_')) {
            return false;
         }
         $(this).data('_seq_', rownum);
         rownum++;
      });
      //
      // 
      this.find(firstRowSel).each(function () {
         colX++;
         if ($(this).text() == colhead) {
            if ($(this).data('_dir_') == 'a') {
               $(this).data('_dir_', 'd');
            }
            else {
               $(this).data('_dir_', 'a');
            }
            sortCol = colX;
            sortAsc = ($(this).data('_dir_') == 'a');
         }
         else {
            $(this).data('_dir_', '');
         }
      });

      var RowData = function () {
         this.Seq = 0;
         this.Key = '';
         this.KeyType = 0;  // 0 = string, 1 = number, 2 = date (mm/dd/yyyy), 3 - date (dd/mm/yyyy), 4 - date (yyyy/mm/dd)
         this.Cells = new Array();
      }
      var prevType = -1;
      this.find('tr').not(':first').each(function () {
         var rowData = new RowData();
         rowData.Seq = $(this).data('_seq_');
         colX = -1;
         $(this).children().each(function () {
            colX++;
            var cellValue = RemoveLineBreaksTrim($(this).text());
            if (colX == sortCol) {
               rowData.Key = cellValue;
               if (prevType == 0) {
                  rowData.KeyType = 0;
               }
               else {
                  rowData.KeyType = GetType(cellValue);
               }
               prevType = rowData.KeyType;
            }
            rowData.Cells.push(cellValue);
         });
         tableData.push(rowData);
      });
      //
      // Check data types consistent within a column. If there
      // is a conflict, set column to string type (0).
      if (tableData.length > 1) {
         for (rowX = 0 ; rowX < tableData.length - 1; rowX++) {
            if (tableData[rowX].KeyType != tableData[rowX + 1].KeyType) {
               for (var rowY = 0; rowY < tableData.length; rowY++) {
                  tableData[rowY].KeyType = 0;
               }
               break;
            }
         }
         //
         // Resolve dates
         for (colX = 0; colX < tableData[0].Cells.length; colX++) {
            if (colX == sortCol) {
               if (tableData[0].KeyType == 2) {
                  var validDays = [0, 0, 0];
                  var validMonths = [0, 0, 0];
                  var validYears = [0, 0, 0];
                  for (var rowX = 0; rowX < tableData.length; rowX++) {
                     var parts = tableData[rowX].Cells[colX].split('/');
                     SetStats(parts, 0, validDays, validMonths, validYears);
                     SetStats(parts, 1, validDays, validMonths, validYears);
                     SetStats(parts, 2, validDays, validMonths, validYears);
                  }
                  var dayPos = MaxIndex(validDays);
                  validYears[dayPos] = 0;
                  validMonths[dayPos] = 0;
                  var monthPos = MaxIndex(validMonths);
                  validYears[monthPos] = 0;
                  var yearPos = MaxIndex(validYears);
                  if (monthPos == 0 && dayPos == 1 && yearPos == 2) {
                     tableData[0].KeyType = 2;
                  }
                  else if (monthPos == 1 && dayPos == 0 && yearPos == 2) {
                     tableData[0].KeyType = 3;
                  }
                  else if (monthPos == 1 && dayPos == 2 && yearPos == 0) {
                     tableData[0].KeyType = 4;
                  }
                  else {
                     tableData[0].KeyType = 0;
                  }
                  for (var rowX = 1; rowX < tableData.length; rowX++) {
                     tableData[rowX].KeyType = tableData[0].KeyType;
                  }
                  break;
               }
            }
         }
      }

      if (colhead) {
         tableData.sort(function (a, b) {
            switch (a.KeyType) {
               case 0:
                  if (a.Key > b.Key) {
                     return sortAsc ? 1 : -1;
                  }
                  if (a.Key < b.Key) {
                     return sortAsc ? -1 : 1;
                  }
                  break;
               case 1:
                  if (parseFloat(a.Key) > parseFloat(b.Key)) {
                     return sortAsc ? 1 : -1;
                  }
                  if (parseFloat(a.Key) < parseFloat(b.Key)) {
                     return sortAsc ? -1 : 1;
                  }
                  break;
               default:
                  var res = DateCompare(a.KeyType, a.Key, b.Key);
                  if (res == 1) {
                     return sortAsc ? 1 : -1;
                  }
                  if (res == -1) {
                     return sortAsc ? -1 : 1;
                  }
            }
            if (a.Seq > b.Seq) {
               return 1;
            }
            return -1;
         });
      }
      else {
         tableData.sort(function (a, b) {
            if (a.Seq > b.Seq) {
               return 1;
            }
            return -1;
         });
      }
      rowX = -1;
      this.find('tr').not(':first').each(function () {
         rowX++;
         var rowData = tableData[rowX];
         $(this).data('_seq_', rowData.Seq);
         colX = -1;
         $(this).children().each(function () {
            colX++;
            $(this).text(rowData.Cells[colX]);
         });
      });
      return this;
   }
   var SetStats = function (parts, i, validDays, validMonths, validYears) {
      if (parts[i] > 0 && parts[i] <= 12) {
         validMonths[i]++;
         validDays[i]++;
         validYears[i]++;
      }
      else if (parts[i] > 0 && parts[i] <= 31) {
         validDays[i]++;
         validYears[i]++;
      }
      else {
         validYears[i]++;
      }
   }
   var MaxIndex = function (validPart) {
      var maxValue = -1;
      var maxIndex = 0;
      for (var i = validPart.length - 1; i >= 0; i--) {
         if (validPart[i] > maxValue) {
            maxValue = validPart[i];
            maxIndex = i;
         }
      }
      return maxIndex;
   }
   var GetType = function (cellValue) {
      if (cellValue.indexOf('/') == -1 && parseFloat(cellValue)) {
         return 1;
      }
      var parts = cellValue.split('/');
      if (parts.length != 3) {
         return 0;
      }
      var dd = parseInt(parts[1]);
      if (isNaN(dd)) {
         return 0;
      }
      var mm = parseInt(parts[0]);
      if (isNaN(mm)) {
         return 0;
      }
      var yyyy = parseInt(parts[2]);
      if (isNaN(yyyy)) {
         return 0;
      }
      return 2;
   }
   var IsLeapYear = function (year) {
      return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
   }
   var DateCompare = function (keyType, dateA, dateB) {
      // 2 = date (mm/dd/yyyy), 3 - date (dd/mm/yyyy), 4 - date (yyyy/mm/dd)
      yearPos = keyType == 4 ? 0 : 2;
      monthPos = keyType == 2 ? 1 : 2;
      dayPos = keyType == 2 ? 0 : keyType = 3 ? 0 : 2;
      var partsA = dateA.split('/');
      var partsB = dateB.split('/');
      // Years
      if (parseInt(partsA[yearPos]) > parseInt(partsB[yearPos])) {
         return 1;
      }
      if (parseInt(partsA[yearPos]) < parseInt(partsB[yearPos])) {
         return -1;
      }
      // Months 
      if (parseInt(partsA[monthPos]) > parseInt(partsB[monthPos])) {
         return 1;
      }
      if (parseInt(partsA[monthPos]) < parseInt(partsB[monthPos])) {
         return -1;
      }
      // Days 
      if (parseInt(partsA[dayPos]) > parseInt(partsB[dayPos])) {
         return 1;
      }
      if (parseInt(partsA[dayPos]) < parseInt(partsB[dayPos])) {
         return -1;
      }
      return 0;
   }
   var RemoveLineBreaksTrim = function (htmlString) {
      htmlString = htmlString.replace(/(\r\n|\n|\r)/gm, " ");
      return htmlString.trim();
   }
}(jQuery));
