jQuery(document).ready(function($) {
	var queueTotal, qCount, queue, time;

	// function upDB is called to update the CDN Sync Tool database upon completion
	function upDB(time) {
		$.ajax({
			type: "post",
			url: syncAjax.ajax_url,
			data: {action: 'cst_update_db', cst_check: syncAjax.cst_check, time: time},
			success: function(e) {
				console.log(e);
				$(".status").html('Syncing complete!');
				$('.cst-progress').append('<strong>All files synced.</strong>');
				$(".cst-progress-return").show();
			}
		});
	}

	// function sync is called recursively to sync individual files to the CDN
	function sync() {
		if(!queue || queue.length <= 0) {
			upDB(time);
			return;
		}
		var passedFile = queue.shift(); 
		var syncFileData = {
			action: 'cst_sync_file',
			cst_check: syncAjax.cst_check,
			file: passedFile,
			total: queueTotal
			};
		$.ajax({
			type: "post",
			url: syncAjax.ajax_url,
			data: syncFileData,
			success: function(response) {
				$(".status").html('Syncing '+(qCount - 1)+' of '+queueTotal);
				$(".cst-progress").append(response);
				qCount--;
				sync();
			}
		});
	}

	// parameters to retrieve CDN queue
	var data = {
		action: 'cst_get_queue',
		cst_check: syncAjax.cst_check
	};

	// We can also pass the url value separately from ajaxurl for front end AJAX implementations
	$.ajax({
		type: "post",
		url: syncAjax.ajax_url,
		data: data,
		success: function(q) {
			queueTotal = q.length;
			qCount = q.length;
			if (q.length > 0) {
				var date = new Date();
				time = date.getTime();
				$(".cst-progress").before('<div class="status"></div>');
				queue = q;
				sync();
			} else { 
				// either no files or error
				$(".cst-progress").append(q);
				$('.cst-progress').append('<strong>No files were available for syncing (or an error was encountered).</strong>');
				$(".cst-progress-return").show();
			}

			// Upon completion, show the Return to Options Page button
/*
			$(".cst-progress").ajaxStop(function() {
				console.log(time);
				upDB(time);
			});
*/
		},
		error: function(xhr, textStatus, errorThrown) {
			$('.cst-progress').append('<strong>There was an error in retrieving the list of files to sync.</strong>');
			$('.cst-progress').append('Text status: ' + textStatus + '<br /><br />');
			$('.cst-progress').append('Error thrown: ' + errorThrown + '<br /><br />');
			$(".cst-progress-return").show();
		}
		dataType: 'json'
	});

});
