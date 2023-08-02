package main

import (
	"encoding/json"
	"fmt"
	"syscall/js"

	"github.com/rutmanz/cgapi/cs1"
	"github.com/rutmanz/cgapi/util"
)

func main() {
	fmt.Println("WASM Loaded")
	js.Global().Set("getSchedule", scheduleWrapper())
	<-make(chan bool)
}
func scheduleWrapper() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) any {
		if len(args) != 2 {
			return "Invalid no of arguments passed"
		}
		user := args[0].String()
		token := args[1].String()
		handler := js.FuncOf(func(this js.Value, args []js.Value) any {
			resolve := args[0]
			reject := args[1]
			fmt.Printf("fetching %s", user)
			go func() {
				result := getSchedule(user, token)
				pretty, err := json.MarshalIndent(result, "", "  ")
				if err != nil {
					fmt.Println(err.Error())
					reject.Invoke(err.Error())
				}
				resolve.Invoke(string(pretty))
			}()
			return nil
		})
		promiseConstructor := js.Global().Get("Promise")
		return promiseConstructor.New(handler)
	})
}

func getSchedule(user string, token string) util.ReturnType {
	return util.GetMutualClasses(cs1.NewClient(user, token))
}
