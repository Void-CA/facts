// 1. Nuevas importaciones
use tauri_plugin_shell::ShellExt; 
use tauri_plugin_shell::process::CommandEvent;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 2. Registramos el plugin shell
        .plugin(tauri_plugin_shell::init()) 
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| { // <--- 3. Cambiamos '_app' a 'app' para usarlo
            
            // 4. Sintaxis v2 para sidecar
            let (mut rx, _child) = app.shell().sidecar("FactsBackend")
                .expect("No se encontró la configuración del sidecar FactsBackend")
                .spawn()
                .expect("No se pudo iniciar backend .NET");

            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        // 5. En v2 'line' son bytes (Vec<u8>), hay que convertir a String
                        CommandEvent::Stdout(line_bytes) => {
                            let line = String::from_utf8_lossy(&line_bytes);
                            println!("backend: {}", line);
                        }
                        CommandEvent::Stderr(line_bytes) => {
                            let line = String::from_utf8_lossy(&line_bytes);
                            eprintln!("backend error: {}", line);
                        }
                        _ => {}
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}