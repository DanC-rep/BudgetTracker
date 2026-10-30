using BudgetTracker.Application.Abstractions;
using BudgetTracker.Application.DependencyInjection;
using BudgetTracker.Infrastructure.DependencyInjection;
using System.Text.Json;
using System.Text.Json.Serialization;
using BudgetTracker.Web.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddApplication();

builder.Services.AddBudgetTrackerDbContext(
    builder.Configuration.GetConnectionString("BudgetTrackerDb")
        ?? throw new InvalidOperationException("Connection string 'BudgetTrackerDb' is not configured."));
builder.Services.AddBudgetTrackerRepositories();
builder.Services.AddBudgetTrackerAuthentication(builder.Configuration);

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserAccessor, CurrentUserAccessor>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
        options.SwaggerEndpoint("/openapi/v1.json", "BudgetTracker API v1"));
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
