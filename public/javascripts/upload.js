var target = $("#target");
target.on('dragenter', function(e) {
    target.addClass('drag');
    target.text('yes, right here!')
});
target.on('dragleave', function(e) {
    target.removeClass('drag');
    target.text('drop images here')
});
target.on('dragleave', function(e) {
    target.removeClass('drag');
    target.text('drop images here')
});
target.on('dragover', function(e) {
    e.preventDefault();
});
target.on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    
    target.removeClass('drag');
    target.text('drop images here')
    
    var files = e.originalEvent.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
        createUploadForm(files[i]);
    }
});

function createUploadForm (file) {
    var parent = $('.parent');
    var child = $(
        '<div class="upload-wrapper">' +
            '<div class="inner">' +
            '<img class="thumb" src="' + window.URL.createObjectURL(file) + '" />' +
            '<input class="name input" name="name" type="textbox"placeholder="my awesome fashun!" />' +
            '<button class="input brand-button small upload">upload!</button>' +
            '</div>' +
        '</div>');

    parent.append(child);
    child.on('click', 'button', function(e) {
        e.stopPropagation();
        e.preventDefault();

        var uploadButton = child.find('.upload');
        var fd = new FormData();
        fd.append('name', child.find('.name').val());
        fd.append('file', file);
        $.ajax({
            url: "/fashuns/add",
            type: "POST",
            data: fd,
            processData: false,
            contentType: false
        })
        .done(function(res) {
            child.append(
                '<div>' + 
                    '<a class="link success" href="' + res + '">upload done! open this fashun</a>' +
                '</div>'
            );
        })
        .error(function() { 
            child.append(
                '<div>' + 
                    '<a class="link fail" href="">upload failed. try again?</a>' +
                '</div>'
            );
            child.find('.link').on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();

                child.find('.input').each(function() { this.disabled = false; });
                child.find('.inner').css('opacity', 1);
                uploadButton.text('retry?');
                this.remove();
            });
        })
        .always(function() { 
            child.find('.input').each(function() { this.disabled = true; });
            child.find('.inner').css('opacity', 0.2);
        });
    });
}
