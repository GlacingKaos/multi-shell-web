var database = firebase.database();
window.addEventListener('load', function () {
    $('.modal').modal();
    M.updateTextFields();
    M.textareaAutoResize($('#command'));
    M.textareaAutoResize($('#edit_command'));
    var modal_add = M.Modal.getInstance($('#modal-add'));
    var modal_edit = M.Modal.getInstance($('#modal-edit'));

    $('#list_commands').on('click', '.add_element', function (e) {
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
        var list_commands = '<li class="collection-item"><div>Commands <a href="#!" class="secondary-content add_element"><i class="material-icons left indigo-text">add</i></a></div></li>';
        for(var key in commands){
            list_commands+=`
            <li class="collection-item _command" data-key="${key}">
                <div>
                    ${key}
                    <a href="#!" class="secondary-content"><i class="material-icons indigo-text edit">edit</i></a>
                    <a href="#!" class="secondary-content"><i class="material-icons indigo-text run">send</i></a>
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
        var new_name = $('#edit_name_console').val();
        var command = $('#edit_command').val();
        if(name!="" && command!=""){
            deleteCommand(name);
            $('#edit_key_name_console').val('');
            $('#edit_name_console').val('');
            $('#edit_command').val('');
            writeCommand(new_name, command);
            modal_edit.close();
        }else{
            alert('can not leave empty fields');
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
                <div id="console-${key}" class="col s12 consoles" style="padding: 0;">
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
        var term = new Terminal({ cursorBlink: true, lineHeight: 0, rows:30/*, scrollback:500 */});
        term.open(terminalContainer);
        term.fit();

        var socket = io.connect();
        socket.on('connect', function () {
            term.write('\r\n*** Connected to backend***\r\n');
            // Browser -> Backend
            term.on('data', function (data) {
                socket.emit('data', data);
            });

            // Backend -> Browser
            socket.on('data', function (data) {
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
            socket.emit('data', command);
        }, 2000);
    });
}

function writeCommand(name, command) {
    database.ref('commands/' + name).set({
        command: command
    });
}

function deleteCommand(name) {
    database.ref('commands/' + name).set(null);
}
