#!/bin/bash

cd /source
/root/.dotnet/tools/dotnet-ef migrations add user_added11511
/root/.dotnet/tools/dotnet-ef database update
dotnet watch --project /source run 
#tail -f /dev/null