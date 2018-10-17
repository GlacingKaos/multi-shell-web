var database = firebase.database();
window.addEventListener('load', function () {
    $('.modal').modal();
    M.updateTextFields();
    M.textareaAutoResize($('#command'));
    M.textareaAutoResize($('#edit_command'));
    var modal_add = M.Modal.getInstance($('#modal-add'));
    var modal_edit = M.Modal.getInstance($('#modal-edit'));

    $(document).on('.add_element', 'click', function (e) {
        e.preventDefault();
        modal_add.open();
    });

    $('#add').click(function (e) {
        e.preventDefault();
        var name = $('#name_console').val();
        var command = $('#command').val();
        if(name!="" && command!=""){
            writeCommand(name, command);
            $('#name_console').val('');
            $('#command').val('');
            modal_add.close();
        }
    });
    var commandsRef = database.ref('commands');
    commandsRef.on('value', function(snapshot) {
        var commands = snapshot.val();
        var list_commands = '<li class="collection-header"><h6>Commands<a class="waves-effect waves-light btn-small right add_element"><i class="material-icons left">add</i></a></h6></li>';
        for(var key in commands){
            list_commands+=`
            <li class="collection-item _command" data-key="${key}">
                <div>
                    ${key}
                    <a href="#!" class="secondary-content badge-text"><i class="material-icons badge-text edit">edit</i></a>
                    <a href="#!" class="secondary-content teal-text"><i class="material-icons teal-text run">send</i></a>
                </div>
            </li>`;
        }
        $('#list_commands').html(list_commands);
    });

    $('#list_commands').on('click', '.edit', function(e){
        e.preventDefault();
        var key = $(this).parents('._command').data('key');
        var commandsRef = database.ref('commands/'+key);
        commandsRef.once('value').then(function(snapshot){
            var command = snapshot.val().command;
            $('#edit_key_name_console').val(key);
            $('#edit_name_console').val(key);
            $('#edit_command').val(command);
            modal_edit.open();
        });
    });

    $('#save').click(function (e) {
        e.preventDefault();
        var name = $('#edit_key_name_console').val();
        var command = $('#edit_command').val();
        if(name!="" && command!=""){
            writeCommand(name, command);
            $('#edit_key_name_console').val('');
            $('#edit_name_console').val('');
            $('#edit_command').val('');
            modal_edit.close();
        }
    });

    $('#list_commands').on('click', '.run', function(e){
        e.preventDefault();
        var key = $(this).parents('._command').data('key');
        if($('.active.menu-console-'+key).html() !== undefined){
            alert('This command was already executed');
        }else{
            $('.view-console').removeClass('active');
            $('#menu_consoles').append(`
                <li class="tab view-console active menu-console-${key}" data-key="${key}"><a href="#${key}" id="menu-console-${key}">${key}</a></li>
            `);
            $('#terminals').append(`
                <div id="console-${key}" class="col s12 consoles">
                    <h6 class="center-align">${key}</h6>
                    <div id="terminal-container-${key}"></div>
                </div>
            `);
            $('.consoles').hide();
            $('#console-'+key).show();
            initShell('terminal-container-'+key, key);
        }
    });

    $('#menu_consoles').on('click', '.view-console', function(e){
        e.preventDefault();
        var key = $(this).data('key');
        $('.view-console').removeClass('active');
        $(this).addClass('active');
        $('.consoles').hide();
        $('#console-'+key).show();
    });
}, false);

function initShell(id, key){
    var commandsRef = database.ref('commands/'+key);
    commandsRef.once('value').then(function(snapshot){
        var command = snapshot.val().command;
        var terminalContainer = document.getElementById(id);
        var term = new Terminal({ cursorBlink: true });
        term.open(terminalContainer);
        term.fit();

        var socket = io.connect();
        socket.on('connect', function () {
            term.write('\r\n*** Connected to backend***\r\n');
            // Browser -> Backend
            term.on('data', function (data) {
                console.log("Browser -> Backend", data);
                socket.emit('data', data);
            });

            // Backend -> Browser
            socket.on('data', function (data) {
                console.log("Backend -> Browser", data);
                term.write(data);
                if(data.indexOf("*** SSH CONNECTION CLOSED ***") > -1){
                    term.destroy();
                    $(".active.menu-console-"+key).remove();
                    $("#console-"+key).remove();
                    socket.close();
                }
            });

            socket.on('disconnect', function () {
                term.write('\r\n*** Disconnected from backend***\r\n');
            });
        });

        setTimeout(function(){
            console.log('command', command);
            socket.emit('data', command);
        }, 2000);
    });
}

function writeCommand(name, command) {
    database.ref('commands/' + name).set({
        command: command
    });
}